from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, AllowAny

from django.shortcuts import get_object_or_404
from drf_spectacular.utils import extend_schema
from django.contrib.auth import get_user_model
from django.core.mail import send_mail
from django.conf import settings
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from django.db import transaction
from django.utils import timezone

from .models import Address, PasswordReset
from .serializers import AddressSerializer, ForgotPasswordSerializer, ResetPasswordSerializer, ResendOTPSerializer, ChangePasswordSerializer

from datetime import timedelta
import logging

logger = logging.getLogger(__name__)
User = get_user_model()

class AddressListView(APIView):
    permission_classes = [IsAuthenticated]
    serializer_class = AddressSerializer
    @extend_schema(operation_id="AddressList")
    
    def get(self, request):
        addresses = Address.objects.filter(user=request.user)
        serializer = AddressSerializer(addresses, many=True)
        return Response(serializer.data)
    
    def post(self, request):
        serializer = AddressSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        print(serializer.errors)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class AddressDetailView(APIView):
    permission_classes = [IsAuthenticated]
    serializer_class = AddressSerializer
    @extend_schema(operation_id="AddressDetailView")
    
    def get_object(self, pk, user):
        return get_object_or_404(Address, id=pk, user=user)
    
    def get(self, request, pk):
        address = self.get_object(pk, request.user)
        serializer = AddressSerializer(address)
        return Response(serializer.data)
    
    def put(self, request, pk):
        address = self.get_object(pk, request.user)
        serializer = AddressSerializer(address, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def delete(self, request, pk):
        address = self.get_object(pk, request.user)
        address.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
class ForgotPasswordView(APIView):
    permission_classes = [AllowAny]
    serializer_class = ForgotPasswordSerializer
    
    @transaction.atomic
    def post(self, request):
        serializer = ForgotPasswordSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        email = serializer.validated_data['email']
        
        try:
            user = User.objects.get(email=email, is_active=True)
            
            # Check if user has existing reset today
            today = timezone.now().date()
            existing_reset = PasswordReset.objects.filter(
                user=user,
                created_at__date=today,
                is_used=False
            ).first()
            
            if existing_reset:
                if existing_reset.email_attempts >= 3:
                    return Response(
                        {"error": "Maximum reset attempts reached for today. Please try again tomorrow."},
                        status=status.HTTP_429_TOO_MANY_REQUESTS
                    )
                if not existing_reset.can_send_email:
                    return Response(
                        {"error": "Please wait before requesting another reset email."},
                        status=status.HTTP_429_TOO_MANY_REQUESTS
                    )
                password_reset = existing_reset
            else:
                password_reset = PasswordReset(user=user)
            
            # Generate OTP and token
            otp = password_reset.generate_otp()
            token = password_reset.generate_token()
            
            password_reset.email_attempts += 1
            password_reset.last_email_sent = timezone.now()
            password_reset.save()
            
            # Send email
            self.send_reset_email(user, otp, token)
            
            return Response({
                "message": "Password reset OTP sent to your email",
                "token": token  # For frontend to use in reset request
            }, status=status.HTTP_200_OK)
            
        except User.DoesNotExist:
            # Don't reveal that email doesn't exist
            return Response(
                {"message": "If the email exists, a reset link has been sent"},
                status=status.HTTP_200_OK
            )
        except Exception as e:
            logger.error(f"Password reset error: {e}")
            print(e)
            return Response(
                {"error": "Failed to process reset request"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def send_reset_email(self, user, otp, token):
        reset_link = f"{settings.FRONTEND_URL}/reset-password?token={token}"
        
        context = {
            'user': user,
            'otp': otp,
            'reset_link': reset_link,
            'expiry_minutes': 15,
            'support_email': settings.SUPPORT_EMAIL
        }
        
        html_message = render_to_string('emails/password_reset.html', context)
        plain_message = strip_tags(html_message)
        
        send_mail(
            'Password Reset Request - Your OTP Code',
            plain_message,
            settings.DEFAULT_FROM_EMAIL,
            [user.email],
            html_message=html_message,
            fail_silently=False,
        )

class ResetPasswordView(APIView):
    permission_classes = [AllowAny]
    serializer_class = ResetPasswordSerializer
    
    @transaction.atomic
    def post(self, request):
        serializer = ResetPasswordSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        email = serializer.validated_data['email']
        otp = serializer.validated_data['otp']
        token = serializer.validated_data['token']
        new_password = serializer.validated_data['new_password']
        
        try:
            user = User.objects.get(email=email, is_active=True)
            
            # Get the reset record
            password_reset = PasswordReset.objects.get(
                user=user,
                token=token,
                is_used=False
            )
            
            if password_reset.is_expired:
                return Response(
                    {"error": "Reset token has expired. Please request a new one."},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            if not password_reset.verify_otp(otp):
                return Response(
                    {"error": "Invalid OTP or too many attempts. Please request a new OTP."},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Update user password
            user.set_password(new_password)
            user.save()
            
            # Mark reset as used
            password_reset.is_used = True
            password_reset.save()
            
            # Invalidate all existing sessions (optional)
            # user.auth_token_set.all().delete()
            
            return Response({
                "message": "Password reset successfully. You can now login with your new password."
            }, status=status.HTTP_200_OK)
            
        except (User.DoesNotExist, PasswordReset.DoesNotExist):
            return Response(
                {"error": "Invalid reset request. Please try again."},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            logger.error(f"Password reset error: {e}")
            return Response(
                {"error": "Failed to reset password"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class ResendOTPView(APIView):
    permission_classes = [AllowAny]
    serializer_class = ResendOTPSerializer
    
    def post(self, request):
        serializer = ResendOTPSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        email = serializer.validated_data['email']
        token = serializer.validated_data['token']
        
        try:
            user = User.objects.get(email=email, is_active=True)
            password_reset = PasswordReset.objects.get(
                user=user,
                token=token,
                is_used=False
            )
            
            if password_reset.is_expired:
                return Response(
                    {"error": "Reset token has expired. Please request a new one."},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            if not password_reset.can_send_email:
                return Response(
                    {"error": "Please wait before requesting another OTP."},
                    status=status.HTTP_429_TOO_MANY_REQUESTS
                )
            
            # Generate new OTP
            new_otp = password_reset.generate_otp()
            password_reset.email_attempts += 1
            password_reset.last_email_sent = timezone.now()
            password_reset.save()
            
            # Resend email
            self.send_reset_email(user, new_otp, token)
            
            return Response({
                "message": "New OTP sent to your email"
            }, status=status.HTTP_200_OK)
            
        except (User.DoesNotExist, PasswordReset.DoesNotExist):
            return Response(
                {"error": "Invalid request"},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    def send_reset_email(self, user, otp, token):
        # Same email function as ForgotPasswordView
        reset_link = f"{settings.FRONTEND_URL}/reset-password?token={token}"
        
        context = {
            'user': user,
            'otp': otp,
            'reset_link': reset_link,
            'expiry_minutes': 15
        }
        
        html_message = render_to_string('templates/emails/password_reset_otp.html', context)
        plain_message = strip_tags(html_message)
        
        send_mail(
            'Your New OTP Code',
            plain_message,
            settings.DEFAULT_FROM_EMAIL,
            [user.email],
            html_message=html_message,
            fail_silently=False,
        )




class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ChangePasswordSerializer
    
    @transaction.atomic
    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data, context={'request': request})
        
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        user = request.user
        new_password = serializer.validated_data['new_password']
        
        try:
            # Update password
            user.set_password(new_password)
            user.save()
            
            # Optional: Invalidate other sessions (except current one)
            self.invalidate_other_sessions(user, request)
            
            # Send confirmation email
            self.send_password_changed_email(user)
            
            return Response({
                "message": "Password changed successfully."
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Password change error: {e}")
            return Response(
                {"error": "Failed to change password"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def invalidate_other_sessions(self, user, request):
        """Invalidate all other sessions except current one"""
        try:
            # Get current session key from request
            current_session_key = request.session.session_key
            
            # Invalidate all other sessions
            from django.contrib.sessions.models import Session
            user_sessions = Session.objects.filter(
                session_data__contains=str(user.id)
            ).exclude(session_key=current_session_key)
            
            user_sessions.delete()
            
        except Exception as e:
            logger.warning(f"Session invalidation error: {e}")

    
    def send_password_changed_email(self, user):
        """Send password change confirmation email"""
        try:
            context = {
                'user': user,
                'timestamp': timezone.now(),
                'support_email': getattr(settings, 'SUPPORT_EMAIL', 'support@example.com')
            }
            
            html_message = render_to_string('emails/password_changed.html', context)
            plain_message = strip_tags(html_message)
            
            send_mail(
                'Password Changed Successfully',
                plain_message,
                getattr(settings, 'DEFAULT_FROM_EMAIL', 'noreply@example.com'),
                [user.email],
                html_message=html_message,
                fail_silently=True,  # Silent fail for non-critical email
            )
        except Exception as e:
            logger.error(f"Password change email error: {e}")
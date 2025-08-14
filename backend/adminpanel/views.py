from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.core.mail import send_mail
from django.conf import settings
from .models import User, OTP
from .serializers import (
    UserSerializer, 
    RegisterSerializer, 
    MyTokenObtainPairSerializer,
    OTPSerializer
)
import pyotp
import random
import string
import logging

from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import MyTokenObtainPairSerializer
from rest_framework_simplejwt.exceptions import TokenError

logger = logging.getLogger(__name__)



class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer
    
    
class RegisterView(APIView):
    serializer_class = RegisterSerializer  
    permission_classes = [AllowAny]
    
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            
            # Create OTP for the user
            otp = OTP.create_otp_for_user(user)
            otp_code = otp.generate_otp()
            
            # Send OTP via email
            send_mail(
                'Your OTP for Account Verification',
                f'Your OTP is: {otp_code}',
                settings.DEFAULT_FROM_EMAIL,
                [user.email],
                fail_silently=False,
            )
            
            return Response({
                'message': 'User registered successfully. Please verify your email with OTP.',
                'user': UserSerializer(user).data
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class VerifyOTPView(APIView):
    serializer_class = OTPSerializer
    permission_classes = [AllowAny]
    
    def post(self, request):
        email = request.data.get('email')
        otp_code = request.data.get('otp')
        
        if not email or not otp_code:
            return Response(
                {'error': 'Email and OTP are required.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            user = User.objects.get(email=email)
            otp = OTP.objects.get(user=user)
            
            if otp.verify_otp(otp_code):
                otp.is_verified = True
                otp.save()
                user.is_active = True
                user.save()
                
                # Generate tokens
                refresh = MyTokenObtainPairSerializer.get_token(user)
                
                return Response({
                    'message': 'OTP verified successfully.',
                    'access': str(refresh.access_token),
                    'refresh': str(refresh),
                    'user': UserSerializer(user).data
                }, status=status.HTTP_200_OK)
            else:
                return Response(
                    {'error': 'Invalid OTP or OTP expired.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        except User.DoesNotExist:
            return Response(
                {'error': 'User with this email does not exist.'},
                status=status.HTTP_404_NOT_FOUND
            )
        except OTP.DoesNotExist:
            return Response(
                {'error': 'No OTP found for this user.'},
                status=status.HTTP_404_NOT_FOUND
            )

class LoginView(APIView):
    serializer_class = MyTokenObtainPairSerializer
    permission_classes = [AllowAny]
    
    def post(self, request):
        try:
            email = request.data.get('email')
            password = request.data.get('password')
            
            user = authenticate(email=email, password=password)
            
            # --- Handle Expected Failures ---
            if user is None:
                return Response(
                    {'error': 'Invalid credentials.'},
                    status=status.HTTP_401_UNAUTHORIZED
                )
            
            if not user.is_active:
                return Response(
                    {'error': 'Account not verified. Please verify your email.'},
                    status=status.HTTP_401_UNAUTHORIZED
                )
            
            # --- If Successful ---
            refresh = MyTokenObtainPairSerializer.get_token(user)
            response = Response({
                'access': str(refresh.access_token),
                'user': UserSerializer(user).data
            }, status=status.HTTP_200_OK)

            response.set_cookie(
                key=settings.SIMPLE_JWT['AUTH_COOKIE_REFRESH'],
                value=str(refresh),
                httponly=True,
                secure=settings.SIMPLE_JWT['AUTH_COOKIE_SECURE'],
                samesite=settings.SIMPLE_JWT['AUTH_COOKIE_SAMESITE'],
                max_age=settings.SIMPLE_JWT['REFRESH_TOKEN_LIFETIME'].total_seconds(),
            )
            
            return response

        # --- Handle Unexpected System Errors ---
        except Exception as e:
            # Log the full error for debugging
            logger.error(f"An unexpected error occurred during login: {e}")
            
            # Return a generic server error to the user
            return Response(
                {'error': 'A server error occurred. Please try again later.'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )







from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator

@method_decorator(csrf_exempt, name='dispatch')
class RefreshTokenView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        try:
            # 1. Get refresh token from cookie
            refresh_token = (request.COOKIES.get('refresh') or request.COOKIES.get('refresh_token'))
        
            if not refresh_token:
                print("Available cookies:", request.COOKIES)  # Debug
                return Response({'error': 'Refresh token missing'}, status=401)

            # 2. Verify and decode the refresh token
            refresh = RefreshToken(refresh_token, verify=True)
            user_id = refresh.payload.get('user_id')
            
            if not user_id:
                print("Invalid token payload, user_id not found")
                return Response({'error': 'Invalid token payload'}, status=401)

            # 3. Get user from database
            user = User.objects.get(id=user_id)
            
            # 4. Generate new tokens
            new_refresh = RefreshToken.for_user(user)
            new_access = str(new_refresh.access_token)
            print(f"{new_access} new access token")
            print(f"{new_refresh} new refresh token  ")
            
            # 5. Prepare response with all tokens
            response = Response({
                'access': new_access,
                'refresh': str(new_refresh),
                'user': UserSerializer(user).data
            }, status=200)

            # 6. Set cookies (matching your LoginView settings)
            response.set_cookie(
                key=settings.SIMPLE_JWT['AUTH_COOKIE_REFRESH'],
                value=str(new_refresh),
                httponly=True,
                secure=settings.SIMPLE_JWT['AUTH_COOKIE_SECURE'],
                samesite=settings.SIMPLE_JWT['AUTH_COOKIE_SAMESITE'],
                max_age=settings.SIMPLE_JWT['REFRESH_TOKEN_LIFETIME'].total_seconds(),
            )          
            
            return response

        except (TokenError, User.DoesNotExist) as e:
            print("exception occurred:", str(e))
            return Response({'error': 'Invalid refresh token'}, status=401)
        except Exception as e:
            print("An unexpected error occurred   2222:", str(e))
            logger.error(f"Refresh token error: {str(e)}")
            return Response({'error': 'Token refresh failed'}, status=500)












class UserProfileView(APIView):
    serializer_class = UserSerializer 
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data, status=status.HTTP_200_OK)

class AdminDashboardView(APIView):
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        if not request.user.is_admin:
            return Response(
                {'error': 'You are not authorized to access this resource.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        users = User.objects.all()
        serializer = UserSerializer(users, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    


class LogoutView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        response = Response({"message": "Logout successful."}, status=status.HTTP_200_OK)
        # Clear the refresh token cookie
        response.delete_cookie(settings.SIMPLE_JWT['AUTH_COOKIE_REFRESH'])
        return response
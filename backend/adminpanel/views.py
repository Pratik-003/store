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


logger = logging.getLogger(__name__)



class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer
    
    
class RegisterView(APIView):
    serializer_class = RegisterSerializer  
    permission_classes = [AllowAny]
    
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save(is_active=False)
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
                samesite=settings.SIMPLE_JWT['AUTH_COOKIE_SAMESITE']
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







class RefreshTokenView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        refresh_token = request.COOKIES.get(settings.SIMPLE_JWT['AUTH_COOKIE_REFRESH'])
        if not refresh_token:
            return Response({'error': 'Refresh token not found.'}, status=status.HTTP_401_UNAUTHORIZED)
        
        try:
            # We don't need to validate the token here as SimpleJWT's RefreshToken will do it
            token = RefreshToken(refresh_token)
            
            # The token is valid, get a new access token
            new_access_token = str(token.access_token)
            
            return Response({'access': new_access_token}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': 'Invalid or expired refresh token.'}, status=status.HTTP_401_UNAUTHORIZED)















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
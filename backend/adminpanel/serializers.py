from rest_framework import serializers
from .models import User, OTP
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'is_admin', 'created_at']
        read_only_fields = ['created_at']



class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True)
    
    class Meta:
        model = User
        fields = ['username', 'email', 'password']

    def validate_email(self, value):
      
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("This email is already registered.")
        return value
    
    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            is_active=False
        )
        return user

class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        
        # Use user.userid instead of the default id
        token['user_id'] = str(user.id)
        token['username'] = user.username
        token['email'] = user.email
        token['is_admin'] = user.is_admin
        
        return token


class OTPSerializer(serializers.ModelSerializer):
    class Meta:
        model = OTP
        fields = ['otp_secret', 'otp_created', 'otp_count', 'is_verified']
        read_only_fields = ['otp_secret', 'otp_created', 'otp_count', 'is_verified']
        
        
class EmptySerializer(serializers.Serializer):
    pass
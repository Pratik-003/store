# Move the YAML schema to the very top (before any imports)
"""
components:
  schemas:
    User:
      type: object
      properties:
        userid:
          type: string
        username:
          type: string
        email:
          type: string
          format: email
        is_admin:
          type: boolean
        created_at:
          type: string
          format: date-time
      example:
        userid: "ABC123"
        username: "john_doe"
        email: "john@example.com"
        is_admin: false
        created_at: "2024-01-01T00:00:00Z"
"""


from rest_framework import serializers
from .models import User, OTP
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['userid', 'username', 'email', 'is_admin', 'created_at']
        read_only_fields = ['userid', 'created_at']


import uuid
def generate_unique_userid():
    # This generates a short, unique ID. You can customize this logic.
    return uuid.uuid4().hex[:4].upper()


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
            userid=generate_unique_userid(),
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
        token['user_id'] = str(user.userid)
        token['username'] = user.username
        token['email'] = user.email
        token['is_admin'] = user.is_admin
        
        return token

class OTPSerializer(serializers.ModelSerializer):
    class Meta:
        model = OTP
        fields = ['otp_secret', 'otp_created', 'otp_count', 'is_verified']
        read_only_fields = ['otp_secret', 'otp_created', 'otp_count', 'is_verified']
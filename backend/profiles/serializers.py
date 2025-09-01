from rest_framework import serializers
from .models import Address, PasswordReset
from django.contrib.auth.password_validation import validate_password

class AddressSerializer(serializers.ModelSerializer):
    full_address = serializers.SerializerMethodField()
    
    class Meta:
        model = Address
        fields = ['id', 'user', 'phone', 'address_type', 'street', 'city', 
                 'state', 'zip_code', 'is_default', 'created_at', 'full_address']
    
    def get_full_address(self, obj):
        return obj.get_full_address()


class ForgotPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def validate_email(self, value):
        from django.contrib.auth import get_user_model
        User = get_user_model()
        
        if not User.objects.filter(email=value, is_active=True).exists():
            raise serializers.ValidationError("No active user found with this email address.")
        return value

class ResetPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField()
    otp = serializers.CharField(max_length=6, min_length=6)
    token = serializers.CharField()
    new_password = serializers.CharField(write_only=True, min_length=8)
    confirm_password = serializers.CharField(write_only=True, min_length=8)

    def validate(self, data):
        if data['new_password'] != data['confirm_password']:
            raise serializers.ValidationError({"confirm_password": "Passwords do not match."})
        
        # Validate password strength
        try:
            validate_password(data['new_password'])
        except Exception as e:
            raise serializers.ValidationError({"new_password": list(e.messages)})
        
        return data

class ResendOTPSerializer(serializers.Serializer):
    email = serializers.EmailField()
    token = serializers.CharField()


class ChangePasswordSerializer(serializers.Serializer):
    current_password = serializers.CharField(write_only=True, required=True)
    new_password = serializers.CharField(write_only=True, min_length=8, required=True)
    confirm_password = serializers.CharField(write_only=True, min_length=8, required=True)

    def validate(self, data):
        if data['new_password'] != data['confirm_password']:
            raise serializers.ValidationError({"confirm_password": "Passwords do not match."})
        
        # Validate password strength
        try:
            validate_password(data['new_password'])
        except Exception as e:
            raise serializers.ValidationError({"new_password": list(e.messages)})
        
        return data

    def validate_current_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError("Current password is incorrect.")
        return value
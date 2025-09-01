from django.db import models
from adminpanel.models import User  
from django.utils import timezone
from django.conf import settings
import pyotp
import jwt
from datetime import timedelta

class Address(models.Model):
    ADDRESS_TYPES = (
        ('home', 'Home'),
        ('work', 'Work'),
        ('other', 'Other'),
    )
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='addresses')
    phone = models.CharField(max_length=15, null=False, blank=False)
    address_type = models.CharField(max_length=10, choices=ADDRESS_TYPES, default='home')
    street = models.TextField()
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=100)
    zip_code = models.CharField(max_length=6)
    is_default = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)      
    
    class Meta:
        verbose_name_plural = "Addresses"
        ordering = ['-is_default', '-created_at'] 
    
    def __str__(self):
        return f"{self.user.email} - {self.address_type} - {self.city}"
    
    def save(self, *args, **kwargs):
        if self.is_default:
            Address.objects.filter(user=self.user, is_default=True).update(is_default=False)
        super().save(*args, **kwargs)
        
    def get_full_address(self):
        return f"{self.street}, {self.city}, {self.state} {self.zip_code}"

    def set_as_default(self):
        self.is_default = True
        self.save()


class PasswordReset(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='password_resets')
    otp = models.CharField(max_length=6)
    token = models.CharField(max_length=255, unique=True)
    otp_attempts = models.IntegerField(default=0)
    email_attempts = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    last_otp_attempt = models.DateTimeField(null=True, blank=True)
    last_email_sent = models.DateTimeField(null=True, blank=True)
    expires_at = models.DateTimeField()
    is_verified = models.BooleanField(default=False)
    is_used = models.BooleanField(default=False)

    class Meta:
        indexes = [
            models.Index(fields=['user', 'created_at']),
            models.Index(fields=['expires_at', 'is_used']),
            models.Index(fields=['token']),
        ]
        ordering = ['-created_at']

    def __str__(self):
        return f"PasswordReset for {self.user.email} - {self.created_at}"

    @property
    def is_expired(self):
        return timezone.now() > self.expires_at

    @property
    def can_send_email(self):
        if self.email_attempts >= 3:
            return False
        if self.last_email_sent:
            # Prevent sending emails too frequently (min 1 minute gap)
            return timezone.now() > self.last_email_sent + timedelta(minutes=1)
        return True

    @property
    def can_attempt_otp(self):
        return self.otp_attempts < 3 and not self.is_verified

    def generate_otp(self):
        """Generate a new 6-digit OTP"""
        self.otp = pyotp.random_base32()[:6].upper()  # Simple 6-digit OTP
        self.expires_at = timezone.now() + timedelta(minutes=15)
        return self.otp

    def generate_token(self):
        """Generate JWT token for password reset"""
        payload = {
            'user_id': self.user.id,
            'email': self.user.email,
            'exp': timezone.now() + timedelta(minutes=15),
            'type': 'password_reset'
        }
        self.token = jwt.encode(payload, settings.SECRET_KEY, algorithm='HS256')
        return self.token

    def verify_otp(self, otp):
        """Verify OTP with attempt counting"""
        if not self.can_attempt_otp:
            return False
        
        self.otp_attempts += 1
        self.last_otp_attempt = timezone.now()
        self.save()
        
        if self.otp == otp and not self.is_expired:
            self.is_verified = True
            self.save()
            return True
        return False
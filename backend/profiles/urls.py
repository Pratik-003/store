from django.urls import path
from .views import AddressListView, AddressDetailView, ForgotPasswordView, ResetPasswordView, ResendOTPView, ChangePasswordView

urlpatterns = [
    path('addresses/', AddressListView.as_view(), name='address-list'),
    path('addresses/<int:pk>/', AddressDetailView.as_view(), name='address-detail'),
    path('forgot-password/', ForgotPasswordView.as_view(), name='forgot-password'),
    path('reset-password/', ResetPasswordView.as_view(), name='reset-password'),
    path('resend-otp/', ResendOTPView.as_view(), name='resend-otp'),
    path('change-password/', ChangePasswordView.as_view(), name='change-password'),  
]
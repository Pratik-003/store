from django.urls import path
from .views import (
    RegisterView,
    VerifyOTPView,
    LoginView,
    UserProfileView,
    AdminDashboardView
)

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('verify-otp/', VerifyOTPView.as_view(), name='verify-otp'),
    path('login/', LoginView.as_view(), name='login'),
    path('profile/', UserProfileView.as_view(), name='profile'),
    path('admin-dashboard/', AdminDashboardView.as_view(), name='admin-dashboard'),
]
from django.shortcuts import render
from adminpanel.serializers import MyTokenObtainPairSerializer, UserSerializer

def generate_tokens_for_user(user):
    refresh = MyTokenObtainPairSerializer.get_token(user)
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
        'user': UserSerializer(user).data
    }
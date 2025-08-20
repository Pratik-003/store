from rest_framework.views import exception_handler
from rest_framework_simplejwt.exceptions import InvalidToken, AuthenticationFailed
from rest_framework import status

def custom_exception_handler(exc, context):
    # Let DRF handle the exception first
    response = exception_handler(exc, context)
    
    # Check if the exception is related to an invalid token (expired, bad format, etc.)
    if isinstance(exc, (InvalidToken, AuthenticationFailed)):
        response.status_code = status.HTTP_401_UNAUTHORIZED
        # You can also customize the response data here if needed
        if response is not None:
            response.data['code'] = "token_not_valid"
            # Ensure the detail is clear
            response.data['detail'] = "Given token not valid. Please log in again."
    
    return response
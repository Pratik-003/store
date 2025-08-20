from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenRefreshView
from adminpanel.views import MyTokenObtainPairView
from django.conf import settings
from django.conf.urls.static import static
from rest_framework import permissions
from drf_yasg.views import get_schema_view
from drf_yasg import openapi

from rest_framework_simplejwt.authentication import JWTAuthentication  # Add this
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

schema_view = get_schema_view(
    openapi.Info(
        title="PratikStore API",
        default_version='v1',
        description="API documentation for PratikStore",
        terms_of_service="https://your-terms-url.com/",  # Add comma
        contact=openapi.Contact(email="contact@pratikstore.com"),  # Fix parenthesis
    ),
    public=True,
    permission_classes=(permissions.AllowAny,),
    authentication_classes=[JWTAuthentication],  # Add this line
) 
    
from rest_framework.documentation import include_docs_urls  
    
urlpatterns = [
    path('schema/', SpectacularAPIView.as_view(), name='schema'),
    path('docs/', SpectacularSwaggerView.as_view(url_name='schema')),
    path('admin/', admin.site.urls),
    path('api/auth/', include('adminpanel.urls')),
    path('api/products/', include('products.urls')),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('swagger/', schema_view.with_ui('swagger', cache_timeout=0)),  # Swagger UI
    path('redoc/', schema_view.with_ui('redoc', cache_timeout=0)),
]




if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
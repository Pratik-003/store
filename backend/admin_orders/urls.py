from django.urls import path
from . import views

urlpatterns = [  # You're missing this line!
    path('manage/pending/', views.AdminPendingOrdersView.as_view(), name='admin-pending-orders'),
    path('manage/<str:order_number>/', views.AdminOrderDetailView.as_view(), name='admin-order-detail'),
    path('manage/<str:order_number>/status/', views.AdminUpdateOrderStatusView.as_view(), name='admin-update-order-status'),
    path('manage/', views.AdminOrdersByStatusView.as_view(), name='admin-orders-by-status'),
]
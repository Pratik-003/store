from django.urls import path
from . import views

urlpatterns = [
    # Cart endpoints
    path('cart/', views.CartDetailView.as_view(), name='cart-detail'),
    path('cart/add/', views.AddToCartView.as_view(), name='add-to-cart'),
    path('cart/update/<int:item_id>/', views.UpdateCartItemView.as_view(), name='update-cart-item'),
    path('cart/remove/<int:item_id>/', views.RemoveCartItemView.as_view(), name='remove-cart-item'),
    
    # Order endpoints
    path('order/create/', views.CreateOrderView.as_view(), name='create-order'),
    path('order/direct-purchase/', views.DirectPurchaseView.as_view(), name='direct-purchase'),
    path('order/', views.OrderListView.as_view(), name='order-list'),
    path('order/<str:order_number>/', views.OrderDetailView.as_view(), name='order-detail'),
    path('order/<str:order_number>/status/', views.OrderStatusView.as_view(), name='order-status'), 
    
    # Payment endpoints
    path('payment/methods/', views.PaymentMethodsView.as_view(), name='payment-methods'),
    path('payment/verify/<str:order_number>/', views.VerifyPaymentView.as_view(), name='verify-payment'),
]
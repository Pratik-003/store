from django.db import models
from django.core.mail import send_mail
from django.conf import settings

from adminpanel.models import User
from products.models import Product  
from profiles.models import Address  

class Cart(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='cart')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Cart #{self.id} - {self.user.email}"

    @property
    def total_price(self):
        return sum(item.total_price for item in self.items.all())

    @property
    def total_items(self):
        return sum(item.quantity for item in self.items.all())

class CartItem(models.Model):
    cart = models.ForeignKey(Cart, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)

    def __str__(self):
        return f"{self.quantity} x {self.product.name}"

    @property
    def total_price(self):
        return self.product.price * self.quantity

class Order(models.Model):
    ORDER_STATUS = (
        ('pending_verification', 'Pending Verification'),
        ('confirmed', 'Confirmed'),
        ('processing', 'Processing'),
        ('shipped', 'Shipped'),
        ('delivered', 'Delivered'),
        ('cancelled', 'Cancelled'),
        ('refunded', 'Refunded'),
    )
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='orders')
    order_number = models.CharField(max_length=20, unique=True)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=25, choices=ORDER_STATUS, default='pending_verification')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    shipping_address = models.ForeignKey(Address, on_delete=models.SET_NULL, null=True, related_name='orders')

    def __str__(self):
        return f"Order #{self.order_number} - {self.user.email} - {self.status}"

    def save(self, *args, **kwargs):
        if not self.order_number:
            # Generate order number (e.g., ORD202312010001)
            from datetime import datetime
            date_str = datetime.now().strftime('%Y%m%d')
            last_order = Order.objects.filter(order_number__startswith=f'ORD{date_str}').order_by('order_number').last()
            if last_order:
                last_num = int(last_order.order_number[-4:])
                new_num = last_num + 1
            else:
                new_num = 1
            self.order_number = f'ORD{date_str}{new_num:04d}'
        
        super().save(*args, **kwargs)
        
        # Send email to admin on new order creation
        if self._state.adding:  # Only on create, not update
            self.send_admin_notification()

    def send_admin_notification(self):
        subject = f'New Order Received: {self.order_number}'
        message = f'''
        New order placed!
        
        Order Number: {self.order_number}
        Customer: {self.user.email}
        Total Amount: ₹{self.total_amount}
        Status: {self.get_status_display()}
        
        Please verify the payment and update the order status.
        '''
        
        # Send to all admin users
        admin_emails = User.objects.filter(is_admin=True).values_list('email', flat=True)
        send_mail(
            subject,
            message,
            settings.DEFAULT_FROM_EMAIL,
            list(admin_emails),
            fail_silently=False,
        )

class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.SET_NULL, null=True)
    product_name = models.CharField(max_length=255)  
    product_price = models.DecimalField(max_digits=10, decimal_places=2)  
    quantity = models.PositiveIntegerField()
    total_price = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return f"{self.quantity} x {self.product_name} (Order: {self.order.order_number})"

    def save(self, *args, **kwargs):
        # Calculate total price
        self.total_price = self.product_price * self.quantity
        super().save(*args, **kwargs)

class Payment(models.Model):
    PAYMENT_METHODS = (
        ('upi', 'UPI Transfer'),
        ('bank_transfer', 'Bank Transfer'),
    )
    
    PAYMENT_STATUS = (
        ('pending', 'Pending'),
        ('verified', 'Verified'),
        ('failed', 'Failed'),
        ('refunded', 'Refunded'),
    )
    
    order = models.OneToOneField(Order, on_delete=models.CASCADE, related_name='payment')
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHODS)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, choices=PAYMENT_STATUS, default='pending')
    
    # UPI/Bank Transfer specific fields
    upi_id = models.CharField(max_length=100, blank=True, null=True)
    bank_account_number = models.CharField(max_length=50, blank=True, null=True)
    bank_name = models.CharField(max_length=100, blank=True, null=True)
    ifsc_code = models.CharField(max_length=20, blank=True, null=True)
    account_holder_name = models.CharField(max_length=100, blank=True, null=True)
    
    # Payment verification fields
    transaction_ss = models.ImageField(upload_to='payment_screenshots/', blank=True, null=True)
    utr_number = models.CharField(max_length=100, blank=True, null=True)
    payment_date = models.DateTimeField(blank=True, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Payment for Order #{self.order.order_number} - {self.get_payment_method_display()} - {self.status}"
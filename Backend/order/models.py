from django.db import models
from django.contrib.auth import get_user_model
from decimal import Decimal
from product.models import ProductModel, ProductColorModel, ProductSizeModel
from user.models import UserModel
from master.models import Country, State, City


class OrderModel(models.Model):

    STATUS_CHOICES = (
        ("Pending", "Pending"),
        ("Processing", "Processing"),
        ("Shipped", "Shipped"),
        ("Delivered", "Delivered"),
        ("Cancelled", "Cancelled"),
    )
    PAYMENT_STATUS_CHOICES = (
        ("Pending", "Pending"),
        ("Paid", "Paid"),
        ("Failed", "Failed"),
        ("Refunded", "Refunded"),
    )
    user = models.ForeignKey(UserModel, on_delete=models.CASCADE, related_name="orders")

    order_number = models.CharField(max_length=50, unique=True)

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")

    subtotal = models.DecimalField(
        max_digits=10, decimal_places=2, default=Decimal("0.00")
    )

    shipping_cost = models.DecimalField(
        max_digits=10, decimal_places=2, default=Decimal("0.00")
    )

    tax_amount = models.DecimalField(
        max_digits=10, decimal_places=2, default=Decimal("0.00")
    )

    total_amount = models.DecimalField(
        max_digits=10, decimal_places=2, default=Decimal("0.00")
    )
    address = models.TextField()
    country = models.ForeignKey(
        Country,
        on_delete=models.PROTECT,
        related_name="order_country",
        null=True,
        blank=True,
    )
    state = models.ForeignKey(
        State,
        on_delete=models.PROTECT,
        related_name="order_state",
        null=True,
        blank=True,
    )
    city = models.ForeignKey(
        City,
        on_delete=models.PROTECT,
        related_name="order_city",
        null=True,
        blank=True,
    )
    payment_status = models.CharField(
        max_length=20,
        choices=PAYMENT_STATUS_CHOICES,
        default="Pending",
    )
    payment_id = models.CharField(
        max_length=255,
        blank=True,
        null=True,
    )

    transaction_id = models.CharField(
        max_length=255,
        blank=True,
        null=True,
    )

    paid_at = models.DateTimeField(
        blank=True,
        null=True,
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.order_number


class OrderItemModel(models.Model):

    order = models.ForeignKey(
        OrderModel, on_delete=models.CASCADE, related_name="items"
    )

    product = models.ForeignKey(ProductModel, on_delete=models.PROTECT)

    color = models.ForeignKey(
        ProductColorModel, on_delete=models.PROTECT, null=True, blank=True
    )
    size = models.ForeignKey(
        ProductSizeModel, on_delete=models.PROTECT, null=True, blank=True
    )
    quantity = models.PositiveIntegerField()

    subtotal = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return f"{self.product.product_name} x {self.quantity}"

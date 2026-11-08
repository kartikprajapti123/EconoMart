from django.db import models
from user.models import UserModel
# Create your models here.
from product.models import ProductModel
from order.models import OrderModel

class ChatModel(models.Model):

    customer = models.ForeignKey(
        UserModel,
        on_delete=models.CASCADE,
        related_name="customer_conversations",
    )


    seller = models.ForeignKey(
        UserModel,
        on_delete=models.CASCADE,
        related_name="seller_conversations",
    )

    product = models.ForeignKey(
        ProductModel,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
    )

    order = models.ForeignKey(
        OrderModel,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
    )

    created_at = models.DateTimeField(auto_now_add=True)

    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-updated_at"]
        
class ChatMessageModel(models.Model):

    chat = models.ForeignKey(
        ChatModel,
        on_delete=models.CASCADE,
        related_name="messages",
    )

    sender = models.ForeignKey(
        UserModel,
        on_delete=models.CASCADE,
        null=True,
        blank=True
    )

    message = models.TextField(null=True,blank=True,default="")

    image = models.ImageField(
        upload_to="chat/",
        blank=True,
        null=True,
    )

    is_read = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["created_at"]
        
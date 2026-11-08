from django.db import models

# Create your models here.
from django.db import models
from user.models import UserModel


class NotificationModel(models.Model):

    TYPE_CHOICES = (
        ("order", "Order"),
        ("support", "Support"),
        ("product", "Product"),
        ("system", "System"),
    )

    recipient = models.ForeignKey(
        UserModel,
        on_delete=models.CASCADE,
        related_name="notifications"
    )

    title = models.CharField(max_length=255)

    message = models.TextField()

    notification_type = models.CharField(
        max_length=100,
        choices=TYPE_CHOICES
    )

    is_read = models.BooleanField(default=False)

    url = models.CharField(
        max_length=255,
        blank=True,
        null=True,
        help_text="Frontend route to navigate when notification is clicked."
    )

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "Notification"
        verbose_name_plural = "Notifications"

    def __str__(self):
        return f"{self.recipient.email} - {self.title}"
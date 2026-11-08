from django.db import models
from user.models import UserModel


class SupportTicketModel(models.Model):
    ISSUE_TYPE_CHOICES = [
        ("Account", "Account"),
        ("Order", "Order"),
        ("Payment", "Payment"),
        ("Product", "Product"),
        ("Bug", "Bug Report"),
        ("Other", "Other"),
    ]

    STATUS_CHOICES = [
        ("Open", "Open"),
        ("In Progress", "In Progress"),
        ("Resolved", "Resolved"),
        ("Closed", "Closed"),
    ]

    user = models.ForeignKey(
        UserModel,
        on_delete=models.CASCADE,
        related_name="support_tickets",
    )

    issue_type = models.CharField(max_length=50, choices=ISSUE_TYPE_CHOICES)
    subject = models.CharField(max_length=255)

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="Open",
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "support_ticket"
        ordering = ["-created_at"]

    def __str__(self):
        return self.subject
    
    
class SupportTicketMessageModel(models.Model):
    ticket = models.ForeignKey(
        SupportTicketModel,
        on_delete=models.CASCADE,
        related_name="messages",
    )

    sender = models.ForeignKey(
        UserModel,
        on_delete=models.CASCADE,
        related_name="support_messages",
    )

    message = models.TextField(blank=True,null=True)

    attachment = models.ImageField(
        upload_to="support/",
        blank=True,
        null=True,
    )

    is_read = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "support_message"
        ordering = ["created_at"]

    def __str__(self):
        return f"{self.sender.email} - {self.ticket.subject}"
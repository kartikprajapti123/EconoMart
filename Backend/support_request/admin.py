from django.contrib import admin

# Register your models here.
from support_request.models import SupportTicketModel,SupportTicketMessageModel


admin.site.register(SupportTicketMessageModel)
admin.site.register(SupportTicketModel)

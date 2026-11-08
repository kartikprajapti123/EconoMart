from django.contrib import admin
from order.models import OrderModel,OrderItemModel
# Register your models here.
admin.register(OrderModel)
admin.register(OrderItemModel)
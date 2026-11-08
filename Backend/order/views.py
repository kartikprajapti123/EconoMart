from django.shortcuts import render
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from rest_framework import status
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet
from rest_framework.permissions import IsAuthenticated
from rest_framework.filters import SearchFilter, OrderingFilter
from rest_framework_simplejwt.authentication import JWTAuthentication
from uuid import uuid4
from decouple import config
from notification.models import NotificationModel
from chat.models import ChatModel,ChatMessageModel
from notification.models import NotificationModel
import traceback
from rest_framework.decorators import action
from django.db import transaction
from order.models import OrderModel, OrderItemModel
from order.serializer import OrderSerializer, OrderItemSerializer
from utils.myPagination import MyPagination
import stripe
from Backend import settings

stripe.api_key = settings.STRIPE_SECRET_KEY
channel_layer=get_channel_layer()

class OrderViewSet(ModelViewSet):
    queryset = OrderModel.objects.all().order_by("-id")
    serializer_class = OrderSerializer

    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    filter_backends = [SearchFilter, OrderingFilter]
    pagination_class = MyPagination

    search_fields = [
        "user__username",
        "order_number",
        "status",
    ]

    ordering_fields = [
        "id",
        "user__username",
        "order_number",
        "status",
        "subtotal",
        "shipping_cost",
        "tax_amount",
        "total_amount",
        "created_at",
        "updated_at",
    ]

    def list(self, request, *args, **kwargs):
        user=request.user
        queryset = self.filter_queryset(self.get_queryset())
        if user.user_type=="Seller":
            queryset = queryset.filter(
                items__product__user=user
            ).distinct()
            
        if user.user_type=="Customer":
            queryset=queryset.filter(user=user)
        orderStatus=request.query_params.get("orderStatus")
        paymentStatus=request.query_params.get("paymentStatus")
        no_pagination = request.query_params.get("no_pagination")
        customOrdering=request.query_params.get("customOrdering")
        
        if orderStatus:
            queryset=queryset.filter(status=orderStatus)
            
        if paymentStatus:
            queryset=queryset.filter(payment_status=paymentStatus)
        if customOrdering:
            queryset=queryset.order_by(f"{customOrdering}")
            
        if no_pagination:
            serializer = self.get_serializer(queryset, many=True)
            return Response(
                {
                    "success": True,
                    "data": serializer.data,
                },
                status=status.HTTP_200_OK,
            )

        page = self.paginate_queryset(queryset)

        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)
        return Response(
            {
                "success": True,
                "data": serializer.data,
            },
            status=status.HTTP_200_OK,
        )

    def create(self, request, *args, **kwargs):
        data = request.data.copy()

        data["user"] = request.user.id
        data["order_number"] = f"ORD-{uuid4().hex[:8].upper()}"

        serializer = self.get_serializer(data=data)

        if serializer.is_valid():

            order = serializer.save()
            
            session = stripe.checkout.Session.create(
                payment_method_types=["card"],
                mode="payment",
                line_items=[
                    {
                        "price_data": {
                            "currency": "eur",
                            "product_data": {
                                "name": f"Order {order.order_number}",
                            },
                            "unit_amount": int(order.total_amount * 100),
                        },
                        "quantity": 1,
                    }
                ],
                metadata={
                    "order_id": str(order.id),
                    "order_number": order.order_number,
                },
                success_url=(
    f"{config('FRONTEND_URL')}checkout?"
    "payment=success&session_id={CHECKOUT_SESSION_ID}"
),
                cancel_url=f"{config('FRONTEND_URL')}checkout?payment=cancel",
            )

            return Response(
                {
                    "success": True,
                    "message": "Order created successfully.",
                    "data": {
                        "order_id": order.id,
                        "order_number": order.order_number,
                        "checkout_url": session.url,
                    },
                },
                status=status.HTTP_201_CREATED,
            )

        first_field = list(serializer.errors.keys())[0]

        return Response(
            {
                "success": False,
                "error": serializer.errors[first_field][0],
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()

        serializer = self.get_serializer(instance)

        return Response(
            {
                "success": True,
                "data": serializer.data,
            },
            status=status.HTTP_200_OK,
        )
    @transaction.atomic()
    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        old_status = instance.status
        serializer = self.get_serializer(
            instance,
            data=request.data,
            partial=True,
        )

        if serializer.is_valid():
            order_updated=serializer.save()
            print(old_status)
            print(order_updated.status)
            if old_status!=order_updated.status:
                print("send_notification")
                notification=NotificationModel.objects.create(
                    recipient=order_updated.user ,
                    title="Order Info",
                    message=f"Order status of {order_updated.order_number} has been Changed",
                    notification_type="order",
                    url=f'/order-details/{order_updated.id}/'
                    
                )
                print(notification)
                async_to_sync(channel_layer.group_send)(
                    f"notification_{order_updated.user.id}",
                    {
                        "type":"send_notification",
                        "id":notification.id,
                        "message":notification.message,
                        'url':notification.url,
                        "notification_type":notification.notification_type,
                        "title":notification.title
                    }
                )
            return Response(
                {
                    "success": True,
                    "message": "Order Successfully Updated",
                    "data": serializer.data,
                },
                status=status.HTTP_200_OK,
            )

        first_field = list(serializer.errors.keys())[0]

        return Response(
            {
                "success": False,
                "error": serializer.errors[first_field][0],
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        deleted_id = instance.id

        instance.delete()

        return Response(
            {
                "success": True,
                "message": "Order Deleted Successfully",
                "id": deleted_id,
            },
            status=status.HTTP_200_OK,
        )

    @action(
        detail=False,
        methods=["POST"],
        permission_classes=[IsAuthenticated],
        url_path="verify-payment",
    )
    def verify_payment(self, request):

        session_id = request.data.get("session_id")

        if not session_id:
            return Response(
                {
                    "success": False,
                    "message": "Session ID is required.",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            session = stripe.checkout.Session.retrieve(session_id)
            print(session)
            if session.payment_status != "paid":
                return Response(
                    {
                        "success": False,
                        "message": "Payment not completed.",
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

            order_id = session.metadata["order_id"]
            order = OrderModel.objects.get(
                id=order_id,
                user=request.user,
            )

            order.payment_status = "Paid"
            order.payment_id = session.payment_intent
            order.status = "Processing"

            order.save()
            

            seller_ids = set()

            for item in order.items.select_related("product__user"):
                seller = item.product.user

                if seller.id not in seller_ids:
                    seller_ids.add(seller.id)

                    chat, created = ChatModel.objects.get_or_create(
                        customer=order.user,
                        seller=seller,
                        order=order,
                        defaults={
                            "product": item.product, 
                        }
                    )

                    if created:
                        ChatMessageModel.objects.create(
                            chat=chat,
                            sender=seller,
                            message=f"Hello! Thank you for your purchase. Order #{order.order_number} has been confirmed and is now processing.",
                        )

                    notification= NotificationModel.objects.create(
                        recipient=seller,
                        title="New Order Received",
                        message=f"You received a new order containing your product(s). Order #{order.order_number}.",
                        url=f"/seller/orders/{order.id}",
                        notification_type="Order",
                    )
                    
                    async_to_sync(channel_layer.group_send)(
                        f"notification_{seller.id}",
                        {
                            "type": "send_notification",
                            "id": notification.id,
                            "title": notification.title,
                            "message": notification.message,
                            "notification_type": notification.notification_type,
                            "url": notification.url,
                            "is_read": notification.is_read,
                            "created_at": notification.created_at.isoformat(),
                        },
                    )

            return Response(
                {
                    "success": True,
                    "message": "Payment verified successfully.",
                }
            )

        except OrderModel.DoesNotExist:
            return Response(
                {
                    "success": False,
                    "message": "Order not found.",
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        except stripe.error.StripeError as e:
            return Response(
                {
                    "success": False,
                    "message": str(e),
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        except Exception as e:

            traceback.print_exc()   # <-- This prints the full error in the terminal    return Response(
            return Response(
        {
            "success": False,
            "message": str(e),
        },
        status=status.HTTP_500_INTERNAL_SERVER_ERROR,
    )

class OrderItemViewSet(ModelViewSet):
    queryset = OrderItemModel.objects.all().order_by("-id")
    serializer_class = OrderItemSerializer

    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    filter_backends = [SearchFilter, OrderingFilter]
    pagination_class = MyPagination

    search_fields = []

    ordering_fields = []

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())

        no_pagination = request.query_params.get("no_pagination")

        if no_pagination:
            serializer = self.get_serializer(queryset, many=True)
            return Response(
                {
                    "success": True,
                    "data": serializer.data,
                },
                status=status.HTTP_200_OK,
            )

        page = self.paginate_queryset(queryset)

        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)
        return Response(
            {
                "success": True,
                "data": serializer.data,
            },
            status=status.HTTP_200_OK,
        )

    def create(self, request, *args, **kwargs):
        data = request.data

        serializer = self.get_serializer(data=data)

        if serializer.is_valid():
            serializer.save()

            return Response(
                {
                    "success": True,
                    "message": "Order Item Successfully Created",
                    "data": serializer.data,
                },
                status=status.HTTP_201_CREATED,
            )

        first_field = list(serializer.errors.keys())[0]
        return Response(
            {
                "success": False,
                "error": serializer.errors[first_field][0],
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()

        serializer = self.get_serializer(instance)

        return Response(
            {
                "success": True,
                "data": serializer.data,
            },
            status=status.HTTP_200_OK,
        )

    def update(self, request, *args, **kwargs):
        instance = self.get_object()

        serializer = self.get_serializer(
            instance,
            data=request.data,
            partial=True,
        )

        if serializer.is_valid():
            serializer.save()

            return Response(
                {
                    "success": True,
                    "message": "Order Item Successfully Updated",
                    "data": serializer.data,
                },
                status=status.HTTP_200_OK,
            )

        first_field = list(serializer.errors.keys())[0]

        return Response(
            {
                "success": False,
                "error": serializer.errors[first_field][0],
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        deleted_id = instance.id

        instance.delete()

        return Response(
            {
                "success": True,
                "message": "Order Item Deleted Successfully",
                "id": deleted_id,
            },
            status=status.HTTP_200_OK,
        )

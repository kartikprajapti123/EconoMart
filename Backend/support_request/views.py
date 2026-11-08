import json

from rest_framework import status
from rest_framework.authentication import SessionAuthentication
from rest_framework.filters import SearchFilter, OrderingFilter
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet
from rest_framework_simplejwt.authentication import JWTAuthentication
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from utils.myPagination import MyPagination
from support_request.models import SupportTicketModel, SupportTicketMessageModel
from support_request.serializer import (
    SupportTicketSerializer,
    SupportTicketMessageSerializer,
)
from notification.models import NotificationModel

channel_layer = get_channel_layer()


class SupportTicketViewSet(ModelViewSet):
    queryset = SupportTicketModel.objects.order_by("-id")
    serializer_class = SupportTicketSerializer
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]
    pagination_class = MyPagination

    filter_backends = [SearchFilter, OrderingFilter]

    search_fields = [
        "subject",
        "issue_type",
        "status",
    ]

    ordering_fields = [
        "id",
        "subject",
        "status",
        "created_at",
    ]

    def get_queryset(self):
        user = self.request.user

        if user.user_type == "Admin":
            return SupportTicketModel.objects.order_by("-id")

        return SupportTicketModel.objects.filter(user=user).order_by("-id")

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())

        no_pagination = request.query_params.get("no_pagination")
        issueType = request.query_params.get("issueType")
        status = request.query_params.get("status")

        if issueType:
            queryset = queryset.filter(issue_type=issueType)
        if status:
            queryset = queryset.filter(status=status)

        if no_pagination:
            serializer = self.get_serializer(queryset, many=True)
            return Response(
                {
                    "success": True,
                    "data": serializer.data,
                }
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
            }
        )

    def retrieve(self, request, *args, **kwargs):
        serializer = self.get_serializer(self.get_object())

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

        serializer = self.get_serializer(data=data)

        if serializer.is_valid():
            ticket=serializer.save()
            
            return Response(
                {
                    "success": True,
                    "message": "Support ticket created successfully.",
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

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        old_status = instance.status
        serializer = self.get_serializer(
            instance=instance,
            data=request.data,
            partial=True,
        )

        if serializer.is_valid():
            updated_ticket = serializer.save()
            if old_status != updated_ticket.status:
                notification=NotificationModel.objects.create(
                    recipient=updated_ticket.user,
                    title="Support Ticket Status Updated",
                    message=(
                        f"Your support ticket '{updated_ticket.subject}' has been updated to {updated_ticket.status}"
                    ),
                    url=f"/support-ticket-message/{updated_ticket.id}/",
                    notification_type="Support_Ticket",
                )
                async_to_sync(channel_layer.group_send)(
                    f"notification_{updated_ticket.user.id}",
                    {
                        "type": "send_notification",
                        "id": notification.id,
                        "notification_type": notification.notification_type,
                        "message": notification.message,
                        "is_read": notification.is_read,
                        "created_at": notification.created_at.isoformat(),
                    },
                )
            return Response(
                {
                    "success": True,
                    "message": "Support ticket updated successfully.",
                    "data": serializer.data,
                }
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
        ticket = self.get_object()
        ticket_id = ticket.id
        ticket.delete()

        return Response(
            {
                "success": True,
                "message": "Support ticket deleted successfully.",
                "id": ticket_id,
            }
        )


class SupportTicketMessageViewSet(ModelViewSet):
    queryset = SupportTicketMessageModel.objects.order_by("created_at")
    serializer_class = SupportTicketMessageSerializer
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]
    pagination_class = MyPagination

    filter_backends = [OrderingFilter]

    ordering_fields = [
        "created_at",
    ]

    def get_queryset(self):
        user = self.request.user

        ticket = self.request.query_params.get("ticket")

        queryset = SupportTicketMessageModel.objects.all()

        if ticket:
            queryset = queryset.filter(ticket_id=ticket)

        if user.user_type != "Admin":
            queryset = queryset.filter(ticket__user=user)

        return queryset.order_by("created_at")

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())

        serializer = self.get_serializer(queryset, many=True)

        return Response(
            {
                "success": True,
                "data": serializer.data,
            }
        )

    def create(self, request, *args, **kwargs):
        data = request.data.copy()

        data["sender"] = request.user.id
        data["attachment"] = request.FILES.get("attachment")

        serializer = self.get_serializer(data=data)

        if serializer.is_valid():
            serializer.save()

            return Response(
                {
                    "success": True,
                    "message": "Message sent successfully.",
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

    def update(self, request, *args, **kwargs):
        data = request.data.copy()
        data["attachment"] = request.FILES.get("attachment")

        serializer = self.get_serializer(
            self.get_object(),
            data=data,
            partial=True,
        )

        if serializer.is_valid():
            serializer.save()

            return Response(
                {
                    "success": True,
                    "message": "Message updated successfully.",
                    "data": serializer.data,
                }
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
        message = self.get_object()
        message_id = message.id
        message.delete()

        return Response(
            {
                "success": True,
                "message": "Message deleted successfully.",
                "id": message_id,
            }
        )

from rest_framework import status
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet
from rest_framework.filters import SearchFilter, OrderingFilter
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework_simplejwt.authentication import JWTAuthentication

from .models import NotificationModel
from notification.serializer import NotificationSerializer
from utils.myPagination import MyPagination


class NotificationViewSet(ModelViewSet):

    queryset = NotificationModel.objects.all().order_by("-id")
    serializer_class = NotificationSerializer

    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    filter_backends = [SearchFilter, OrderingFilter]
    pagination_class = MyPagination

    search_fields = [
        "title",
        "message",
        "notification_type",
    ]

    ordering_fields = [
        "id",
        "title",
        "notification_type",
        "is_read",
        "created_at",
    ]

    def get_queryset(self):
        return NotificationModel.objects.filter(recipient=self.request.user).order_by(
            "-created_at"
        )

    def list(self, request, *args, **kwargs):

        queryset = self.filter_queryset(self.get_queryset())

        notificationType = request.query_params.get("notificationType")
        isRead = request.query_params.get("isRead")
        no_pagination = request.query_params.get("no_pagination")

        if notificationType:
            queryset = queryset.filter(notification_type=notificationType)

        if isRead is not None:
            queryset = queryset.filter(is_read=isRead.lower() == "true")

        if no_pagination:
            serializer = self.get_serializer(
                queryset,
                many=True,
            )

            return Response(
                {
                    "success": True,
                    "data": serializer.data,
                },
                status=status.HTTP_200_OK,
            )

        page = self.paginate_queryset(queryset)

        if page is not None:
            serializer = self.get_serializer(
                page,
                many=True,
            )
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(
            queryset,
            many=True,
        )

        return Response(
            {
                "success": True,
                "data": serializer.data,
            },
            status=status.HTTP_200_OK,
        )

    def retrieve(self, request, *args, **kwargs):

        notification = self.get_object()

        serializer = self.get_serializer(notification)

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
                    "message": "Notification updated successfully.",
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

    @action(detail=False, methods=["patch"],url_path="mark-all-read")
    def mark_all_read(self, request):

        self.get_queryset().filter(is_read=False).update(is_read=True)

        return Response(
            {
                "success": True,
                "message": "All notifications marked as read.",
            },
            status=status.HTTP_200_OK,
        )

    @action(detail=False, methods=["get"],url_path="unread-count")
    def unread_count(self, request):

        count = self.get_queryset().filter(is_read=False).count()

        return Response(
            {
                "success": True,
                "count": count,
            },
            status=status.HTTP_200_OK,
        )

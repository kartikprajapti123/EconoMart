from rest_framework.viewsets import ModelViewSet
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.filters import SearchFilter, OrderingFilter
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status

from .models import ChatModel
from chat.serializer import ChatSerializer
from utils.myPagination import MyPagination

from chat.models import ChatMessageModel
from chat.serializer import ChatMessageSerializer

from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

channel_layer=get_channel_layer()
class ChatViewSet(ModelViewSet):

    queryset = ChatModel.objects.all().order_by("-updated_at")
    serializer_class = ChatSerializer

    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    pagination_class = MyPagination

    filter_backends = [SearchFilter, OrderingFilter]

    search_fields = [
        "customer__username",
        "seller__username",
    ]

    ordering_fields = [
        "id",
        "created_at",
        "updated_at",
    ]

    def get_queryset(self):

        return ChatModel.objects.filter(
            customer=self.request.user,
        ) | ChatModel.objects.filter(
            seller=self.request.user,
        )

    def list(self, request, *args, **kwargs):

        queryset = self.filter_queryset(self.get_queryset().order_by("-updated_at"))

        no_pagination = request.query_params.get("no_pagination")

        if no_pagination:

            serializer = self.get_serializer(
                queryset,
                many=True,
            )

            return Response(
                {
                    "success": True,
                    "data": serializer.data,
                }
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
            }
        )

    def retrieve(self, request, *args, **kwargs):

        serializer = self.get_serializer(self.get_object())

        return Response(
            {
                "success": True,
                "data": serializer.data,
            }
        )

    def create(self, request, *args, **kwargs):

        serializer = self.get_serializer(data=request.data)

        if serializer.is_valid():

            serializer.save(
                customer=request.user,
            )

            return Response(
                {
                    "success": True,
                    "message": "Chat created successfully.",
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

    @action(detail=False, methods=["GET"], url_path="unread-count")
    def unread_count(self, request):

        unread_messages = (
            ChatMessageModel.objects.filter(
                chat__in=self.get_queryset(),
                is_read=False,
            )
            .exclude(sender=request.user)
            .count()
        )

        return Response(
            {
                "success": True,
                "data": {
                    "unread_count": unread_messages,
                },
            },
            status=status.HTTP_200_OK,
        )


class ChatMessageViewSet(ModelViewSet):

    queryset = ChatMessageModel.objects.all().order_by("created_at")
    serializer_class = ChatMessageSerializer

    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    pagination_class = MyPagination

    ordering_fields = [
        "created_at",
    ]

    def get_queryset(self):

        queryset = ChatMessageModel.objects.filter(
            chat__customer=self.request.user,
        ) | ChatMessageModel.objects.filter(
            chat__seller=self.request.user,
        )

        chat = self.request.query_params.get("chat")

        if chat:
            queryset = queryset.filter(chat=chat)

        return queryset.order_by("created_at")

    def list(self, request, *args, **kwargs):

        queryset = self.get_queryset()

        no_pagination = request.query_params.get("no_pagination")

        if no_pagination:

            serializer = self.get_serializer(
                queryset,
                many=True,
            )

            return Response(
                {
                    "success": True,
                    "data": serializer.data,
                }
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
            }
        )

    def create(self, request, *args, **kwargs):

        serializer = self.get_serializer(data=request.data)

        if serializer.is_valid():

            chat_message=serializer.save(
                sender=request.user,
            )
            if chat_message.sender == chat_message.chat.customer:
                receiver = chat_message.chat.seller
            else:
                receiver = chat_message.chat.customer
            
            async_to_sync(channel_layer.group_send)(
                f"notification_{receiver.id}",
                {
                    "type": "chat_change",
                },
            )

            return Response(
                {
                    "success": True,
                    "message": "Message sent successfully.",
                    "data": serializer.data,
                },
                status=status.HTTP_201_CREATED,
            )

            
        
            
        first_field = list(serializer.errors.keys())[0]
        print(serializer.errors)
        return Response(
            {
                "success": False,
                "error": serializer.errors[first_field][0],
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    @action(
        detail=False,
        methods=["patch"],
        url_path="mark-read",
    )
    def mark_read(self, request):

        chat = request.data.get("chat")

        ChatMessageModel.objects.filter(
            chat_id=chat,
            is_read=False,
        ).exclude(
            sender=request.user,
        ).update(
            is_read=True,
        )

        return Response(
            {
                "success": True,
                "message": "Messages marked as read.",
            }
        )

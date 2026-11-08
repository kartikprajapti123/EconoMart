from rest_framework import serializers
from .models import ChatModel, ChatMessageModel


class ChatSerializer(serializers.ModelSerializer):

    customer_username = serializers.CharField(
        source="customer.username",
        read_only=True,
    )

    seller_username = serializers.CharField(
        source="seller.username",
        read_only=True,
    )
    order_number = serializers.CharField(
        source="order.order_number", required=False, read_only=True
    )
    
    product_image = serializers.CharField(
        source="product.product_images.first.image", required=False, read_only=True
    )
    product_name = serializers.CharField(
            source="product.product_name", required=False, read_only=True
        )
    unread_count = serializers.SerializerMethodField()

    partner_name = serializers.SerializerMethodField()
    order_status=serializers.CharField(source="order.status",required=False,read_only=True)
    order_total_amount=serializers.CharField(source="order.total_amount",required=False,read_only=True)
    class Meta:
        model = ChatModel
        fields = [
            "id",
            "customer",
            "customer_username",
            "seller",
            "seller_username",
            "product",
            "product_name",
            "product_image",
            "unread_count",
            "partner_name",
            "order",
            "order_number",
            "order_status",
            "order_total_amount",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "created_at",
            "updated_at",
        ]
        
    def get_partner_name(self, obj):

        request = self.context.get("request")
    
        if request.user == obj.customer:
            return obj.seller.username
    
        return obj.customer.username
    
    def get_unread_count(self, obj):
        request = self.context.get("request")
        return obj.messages.filter(
            is_read=False
        ).exclude(
            sender=request.user
        ).count()

    def validate(self, attrs):

        customer = attrs.get("customer")
        seller = attrs.get("seller")

        if customer == seller:
            raise serializers.ValidationError(
                "Customer and seller cannot be the same user."
            )

        if customer and not customer.is_active:
            raise serializers.ValidationError("Customer account is inactive.")

        if seller and not seller.is_active:
            raise serializers.ValidationError("Seller account is inactive.")

        return attrs

    def create(self, validated_data):

        chat = ChatModel.objects.create(**validated_data)

        return chat

    def update(self, instance, validated_data):

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        instance.save()

        return instance


class ChatMessageSerializer(serializers.ModelSerializer):

    sender_username = serializers.CharField(
        source="sender.username",
        read_only=True,
    )

    sender_profile_image = serializers.ImageField(
        source="sender.profile_image",
        read_only=True,
    )

    class Meta:
        model = ChatMessageModel
        fields = [
            "id",
            "chat",
            "sender",
            "sender_username",
            "sender_profile_image",
            "message",
            "image",
            "is_read",
            "created_at",
        ]

        read_only_fields = [
            "id",
            "created_at",
        ]

    def validate(self, attrs):

        sender = attrs.get("sender")
        message = attrs.get("message")
        image = attrs.get("image")

        if sender and not sender.is_active:
            raise serializers.ValidationError("Sender account is inactive.")

        if not message and not image:
            raise serializers.ValidationError(
                "Either a message or an image is required."
            )

        return attrs

    def create(self, validated_data):

        chat_message = ChatMessageModel.objects.create(**validated_data)

        return chat_message

    def update(self, instance, validated_data):

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        instance.save()

        return instance

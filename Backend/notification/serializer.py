from rest_framework import serializers
from .models import NotificationModel


class NotificationSerializer(serializers.ModelSerializer):

    recipient_username = serializers.CharField(
        source="recipient.username",
        read_only=True,
    )

    class Meta:
        model = NotificationModel
        fields = [
            "id",
            "recipient",
            "recipient_username",
            "title",
            "message",
            "notification_type",
            "is_read",
            "url",
            "created_at",
        ]

        read_only_fields = [
            "id",
            "created_at",
        ]

    def validate(self, attrs):

        recipient = attrs.get("recipient")

        if recipient and not recipient.is_active:
            raise serializers.ValidationError(
                "Cannot send notification to an inactive user."
            )

        return attrs

    def create(self, validated_data):

        notification = NotificationModel.objects.create(**validated_data)

        return notification

    def update(self, instance, validated_data):

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        instance.save()

        return instance
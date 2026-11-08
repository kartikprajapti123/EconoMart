from rest_framework import serializers
from decouple import config

from .models import SupportTicketModel, SupportTicketMessageModel


class SupportTicketSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source="user.username", read_only=True)
    profile_image = serializers.CharField(source="user.profile_image", read_only=True)

    class Meta:
        model = SupportTicketModel
        fields = [
            "id",
            "user",
            "username",
            "profile_image",
            "issue_type",
            "subject",
            "status",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["created_at", "updated_at"]

    def validate(self, attrs):
        subject = attrs.get("subject")
        issue_type = attrs.get("issue_type")

        if not subject:
            raise serializers.ValidationError("Subject is required.")

        if not issue_type:
            raise serializers.ValidationError("Issue type is required.")

        return attrs
    
    def to_representation(self, instance):
        data = super().to_representation(instance)

        if instance.user.profile_image:
            backend_url = config("BACKEND_URL")
            data["profile_image"] = (
                backend_url + "media/" + str(instance.user.profile_image)
        )

        return data
    
    
class SupportTicketMessageSerializer(serializers.ModelSerializer):
    attachment = serializers.ImageField(required=False, allow_null=True)
    username = serializers.CharField(source="sender.username", read_only=True)
    profile_image = serializers.CharField(source="sender.profile_image", read_only=True)
    

    class Meta:
        model = SupportTicketMessageModel
        fields = [
            "id",
            "ticket",
            "sender",
            "username",
            "profile_image",
            "message",
            "attachment",
            "is_read",
            "created_at",
        ]
        read_only_fields = ["is_read", "created_at"]

    def validate(self, attrs):
        message = attrs.get("message")
        attachment = attrs.get("attachment")

        if not message and not attachment:
            raise serializers.ValidationError(
                "Message or attachment is required."
            )

        if attachment:
            max_size = 2 * 1024 * 1024  # 2 MB

            if attachment.size > max_size:
                raise serializers.ValidationError(
                    "Attachment size cannot exceed 2 MB."
                )

        return attrs

    def update(self, instance, validated_data):
        if (
            validated_data.get("attachment")
            and instance.attachment
        ):
            instance.attachment.delete(save=False)

        return super().update(instance, validated_data)

    def to_representation(self, instance):
        data = super().to_representation(instance)

        if instance.attachment:
            data["attachment"] = (
                f"{config('BACKEND_URL')}media/{instance.attachment}"
            )
            
        if instance.sender.profile_image:
            backend_url = config("BACKEND_URL")
            data["profile_image"] = (
                backend_url + "media/" + str(instance.sender.profile_image)
            )

        return data
    
from channels.generic.websocket import AsyncWebsocketConsumer
import json
from channels.db import database_sync_to_async
from support_request.models import SupportTicketMessageModel, SupportTicketModel
from decouple import config
from urllib.parse import urljoin
from notification.models import NotificationModel
from chat.models import ChatMessageModel, ChatModel

ONLINE_USERS = {}


class SupportTicketConsumer(AsyncWebsocketConsumer):

    async def connect(self):
        self.ticket = self.scope["url_route"]["kwargs"]["id"]
        self.group_name = f"ticket_{self.ticket}"
        self.user = self.scope["user"]

        allowed = await self.can_join()

        if not allowed:
            await self.close()
            return

        await self.channel_layer.group_add(self.group_name, self.channel_name)

        # Create ticket entry if it doesn't exist
        if self.group_name not in ONLINE_USERS:
            ONLINE_USERS[self.group_name] = {}

        # Add current user
        ONLINE_USERS[self.group_name][self.user.id] = self.user.username

        await self.accept()

        # Tell the newly connected user who is already online
        for user_id, username in ONLINE_USERS[self.group_name].items():
            if user_id != self.user.id:
                await self.send(
                    text_data=json.dumps(
                        {
                            "type": "user_status",
                            "username": username,
                            "online": True,
                        }
                    )
                )

        # Notify everyone else that I came online
        await self.channel_layer.group_send(
            self.group_name,
            {
                "type": "user_status",
                "username": self.user.username,
                "online": True,
                "sender_channel": self.channel_name,
            },
        )

    async def disconnect(self, close_code):

        if self.group_name in ONLINE_USERS:
            ONLINE_USERS[self.group_name].pop(self.user.id, None)

            if not ONLINE_USERS[self.group_name]:
                del ONLINE_USERS[self.group_name]

        await self.channel_layer.group_send(
            self.group_name,
            {
                "type": "user_status",
                "username": self.user.username,
                "online": False,
                "sender_channel": self.channel_name,
            },
        )

        await self.channel_layer.group_discard(
            self.group_name,
            self.channel_name,
        )

    async def receive(self, text_data):
        data = json.loads(text_data)
        if data["type"] == "support_ticket_message":
            if data.get("support_ticket_message_id"):
                obj = await self.get_message(data["support_ticket_message_id"])
            else:
                obj = await self.save_message(data["message"])

                if obj["notification"]:
                    await self.channel_layer.group_send(
                        f"notification_{obj['notification']['user_id']}",
                        {
                            "type": "send_notification",
                            **obj["notification"],
                        },
                    )

            await self.channel_layer.group_send(
                self.group_name,
                {
                    "type": "support_ticket_message",
                    "id": obj["id"],
                    "ticket": obj["ticket"],
                    "sender": obj["sender"],
                    "username": obj["username"],
                    "profile_image": (
                        obj["profile_image"] if obj["profile_image"] else None
                    ),
                    "message": obj["message"],
                    "attachment": (obj["attachment"] if obj["attachment"] else None),
                    "created_at": obj["created_at"],
                },
            )

        if data["type"] == "typing_start":
            profile_image = (
                urljoin(config("BACKEND_URL"), self.user.profile_image.url)
                if self.user.profile_image
                else None
            )

            await self.channel_layer.group_send(
                self.group_name,
                {
                    "type": "typing_start",
                    "user_id": self.user.id,
                    "username": self.user.username,
                    "profile_image": profile_image,
                },
            )

        if data["type"] == "typing_end":

            await self.channel_layer.group_send(
                self.group_name,
                {"type": "typing_end", "username": data["username"]},
            )

    async def support_ticket_message(self, text):
        await self.send(
            text_data=json.dumps(
                {
                    "type": "support_ticket_message",
                    "message": text["message"],
                    "id": text["id"],
                    "username": text["username"],
                    "profile_image": text["profile_image"],
                    "attachment": text["attachment"],
                    "sender": text["sender"],
                    "created_at": text["created_at"],
                }
            )
        )

    async def typing_start(self, event):
        await self.send(
            text_data=json.dumps(
                {
                    "type": "typing_start",
                    "user_id": event["user_id"],
                    "username": event["username"],
                    "profile_image": event["profile_image"],
                }
            )
        )

    async def typing_end(self, event):
        await self.send(
            text_data=json.dumps(
                {
                    "type": "typing_end",
                    "username": event["username"],
                },
            )
        )

    @database_sync_to_async
    def save_message(self, message):
        ticket = SupportTicketModel.objects.get(id=self.ticket)

        obj = SupportTicketMessageModel.objects.create(
            ticket=ticket,
            sender=self.user,
            message=message,
        )

        send_notification = False

        if self.user.user_type == "Admin":
            is_user_viewing = (
                self.group_name in ONLINE_USERS
                and ticket.user.id in ONLINE_USERS[self.group_name]
            )

            if not is_user_viewing:
                notification = NotificationModel.objects.create(
                    recipient=ticket.user,
                    title="New Message in Support Ticket",
                    message=f"You received a new reply for '{ticket.subject}'.",
                    url=f"/support-ticket-message/{ticket.id}",
                    notification_type="Support",
                )

                send_notification = {
                    "id": notification.id,
                    "user_id": ticket.user.id,
                    "title": notification.title,
                    "message": notification.message,
                    "notification_type": notification.notification_type,
                    "url": notification.url,
                    "is_read": notification.is_read,
                    "created_at": notification.created_at.isoformat(),
                }

        attachment = (
            urljoin(config("BACKEND_URL"), obj.attachment.url)
            if obj.attachment
            else None
        )

        profile_image = (
            urljoin(config("BACKEND_URL"), obj.sender.profile_image.url)
            if obj.sender.profile_image
            else None
        )

        return {
            "id": obj.id,
            "ticket": obj.ticket.id,
            "sender": obj.sender.id,
            "username": obj.sender.username,
            "profile_image": profile_image,
            "message": obj.message,
            "attachment": attachment,
            "created_at": obj.created_at.isoformat(),
            "notification": send_notification,
        }

    @database_sync_to_async
    def can_join(self):

        ticket = SupportTicketModel.objects.get(id=self.ticket)

        if self.user.user_type == "Admin":
            return True

        return ticket.user_id == self.user.id

    @database_sync_to_async
    def get_message(self, id):
        obj = SupportTicketMessageModel.objects.select_related("sender", "ticket").get(
            id=id
        )

        attachment = (
            urljoin(config("BACKEND_URL"), obj.attachment.url)
            if obj.attachment
            else None
        )

        profile_image = (
            urljoin(config("BACKEND_URL"), obj.sender.profile_image.url)
            if obj.sender.profile_image
            else None
        )
        return {
            "id": obj.id,
            "ticket": obj.ticket.id,
            "sender": obj.sender.id,
            "username": obj.sender.username,
            "profile_image": profile_image,
            "message": obj.message,
            "attachment": attachment,
            "created_at": obj.created_at.isoformat(),
        }

    async def user_status(self, event):
        if event["sender_channel"] == self.channel_name:
            return
        await self.send(
            text_data=json.dumps(
                {
                    "type": "user_status",
                    "username": event["username"],
                    "online": event["online"],
                }
            )
        )


class NotificationConsumer(AsyncWebsocketConsumer):

    async def connect(self):
        self.user = self.scope["user"]
        self.group_name = f"notification_{self.user.id}"
        print("WS user:", self.user.id)
        await self.channel_layer.group_add(
            self.group_name,
            self.channel_name,
        )

        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.group_name,
            self.channel_name,
        )

    async def send_notification(self, event):
        print("send_notification_called", event)
        await self.send(text_data=json.dumps(event))
        
    async def chat_change(self, event):
            print("chat_change_called", event)
            await self.send(text_data=json.dumps(event))

ONLINE_CHAT_USERS = {}


class ChatConsumer(AsyncWebsocketConsumer):

    async def connect(self):

        self.user = self.scope["user"]
        self.chat_id = self.scope["url_route"]["kwargs"]["id"]
        self.group_name = f"chat_{self.chat_id}"

        check = await self.check_user()

        if not check:
            await self.close()
            return

        await self.channel_layer.group_add(
            self.group_name,
            self.channel_name,
        )

        if self.group_name not in ONLINE_CHAT_USERS:
            ONLINE_CHAT_USERS[self.group_name] = {}

        ONLINE_CHAT_USERS[self.group_name][self.user.id] = self.user.username

        await self.accept()

        # Tell the newly connected user who is already online
        for user_id, username in ONLINE_CHAT_USERS[self.group_name].items():

            if user_id != self.user.id:

                await self.send(
                    text_data=json.dumps(
                        {
                            "type": "user_status",
                            "user_id": user_id,
                            "username": username,
                            "online": True,
                        }
                    )
                )

        # Tell the other participant that I came online
        await self.channel_layer.group_send(
            self.group_name,
            {
                "type": "user_status",
                "user_id": self.user.id,
                "username": self.user.username,
                "online": True,
                "sender_channel": self.channel_name,
            },
        )

    async def disconnect(self, close_code):

        if self.group_name in ONLINE_CHAT_USERS:

            ONLINE_CHAT_USERS[self.group_name].pop(
                self.user.id,
                None,
            )

            if not ONLINE_CHAT_USERS[self.group_name]:
                del ONLINE_CHAT_USERS[self.group_name]

        # Notify the other participant before leaving
        await self.channel_layer.group_send(
            self.group_name,
            {
                "type": "user_status",
                "user_id": self.user.id,
                "username": self.user.username,
                "online": False,
                "sender_channel": self.channel_name,
            },
        )

        await self.channel_layer.group_discard(
            self.group_name,
            self.channel_name,
        )

    async def receive(self, text_data):

        data = json.loads(text_data)

        message_type = data.get("type")

        if message_type in [
            "chat_message",
            "typing_start",
            "typing_end",
        ]:

            await self.channel_layer.group_send(
                self.group_name,
                {
                    "type": message_type,
                    **data,
                },
            )

    async def chat_message(self, event):

        await self.send(
            text_data=json.dumps(
                {
                    "type": "chat_message",
                    **event,
                }
            )
        )

    async def typing_start(self, event):

        await self.send(
            text_data=json.dumps(
                {
                    "type": "typing_start",
                    **event,
                }
            )
        )

    async def typing_end(self, event):

        await self.send(
            text_data=json.dumps(
                {
                    "type": "typing_end",
                    **event,
                }
            )
        )

    async def user_status(self, event):

        # Don't send my own status back to me
        if event["sender_channel"] == self.channel_name:
            return

        await self.send(
            text_data=json.dumps(
                {
                    "type": "user_status",
                    "user_id": event["user_id"],
                    "username": event["username"],
                    "online": event["online"],
                }
            )
        )

    @database_sync_to_async
    def check_user(self):

        try:

            chat = ChatModel.objects.get(
                id=self.chat_id,
            )

            return (
                chat.customer == self.user
                or chat.seller == self.user
            )

        except ChatModel.DoesNotExist:
            return False
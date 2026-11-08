from django.urls import path
from real_time_connection.consumer import SupportTicketConsumer,NotificationConsumer,ChatConsumer
websocket_urlpatterns = [
    path("ws/support-ticket/<int:id>/", SupportTicketConsumer.as_asgi()),
    path("ws/notification/", NotificationConsumer.as_asgi()),
    path("ws/chat/<int:id>/", ChatConsumer.as_asgi()),
    
]
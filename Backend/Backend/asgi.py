import os

from channels.auth import AuthMiddlewareStack
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.security.websocket import AllowedHostsOriginValidator
from django.core.asgi import get_asgi_application
from django.urls import path
from real_time_connection.middleware import JwtAuthMiddleware
from real_time_connection.router import websocket_urlpatterns
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "Backend.settings")
django_asgi_app = get_asgi_application()

application = ProtocolTypeRouter(
    {
        "http": django_asgi_app,
        "websocket": JwtAuthMiddleware(
        URLRouter(websocket_urlpatterns)
    ),
    }
)

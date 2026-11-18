import os

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "Backend.settings")

from django.core.asgi import get_asgi_application

django_asgi_app = get_asgi_application()

from channels.routing import ProtocolTypeRouter, URLRouter

from real_time_connection.middleware import JwtAuthMiddleware
from real_time_connection.router import websocket_urlpatterns

application = ProtocolTypeRouter({
    "http": django_asgi_app,
    "websocket": JwtAuthMiddleware(
        URLRouter(websocket_urlpatterns)
    ),
})
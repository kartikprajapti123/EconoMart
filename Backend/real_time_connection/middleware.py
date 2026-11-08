from urllib.parse import parse_qs

from channels.db import database_sync_to_async
from django.contrib.auth.models import AnonymousUser

from rest_framework_simplejwt.tokens import AccessToken
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError

from user.models import UserModel   


@database_sync_to_async
def get_user(user_id):
    try:
        return UserModel.objects.get(id=user_id)
    except UserModel.DoesNotExist:
        return AnonymousUser()


class JwtAuthMiddleware:
    def __init__(self, inner):
        self.inner = inner

    async def __call__(self, scope, receive, send):

        query_string = parse_qs(scope["query_string"].decode())

        token = query_string.get("token")

        if token:
            token = token[0]

            try:
                access_token = AccessToken(token)
                user = await get_user(access_token["user_id"])
                scope["user"] = user

            except (InvalidToken, TokenError):
                scope["user"] = AnonymousUser()

        else:
            scope["user"] = AnonymousUser()

        return await self.inner(scope, receive, send)
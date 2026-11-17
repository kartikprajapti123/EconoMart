from django.shortcuts import render
from rest_framework.viewsets import ModelViewSet
from django.contrib.auth.hashers import check_password
import json
from django.db.models import Sum
from django.db.models.functions import TruncMonth
from decouple import config
from django.core.files.base import ContentFile
import uuid
from django.core.cache import cache
# Create your views here.
from django.contrib.auth.models import Group
from calendar import month_abbr
import requests
from user.models import UserModel
from user.serializer import UserSerialzier
from rest_framework.filters import SearchFilter, OrderingFilter
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.response import Response
from rest_framework import status
from utils.myPagination import MyPagination
from utils.generate_token import generate_tokens_for_user
from utils.send_email import send_template_email
from utils.generate_otp import generate_otp
from utils.generate_verification_token import decode_jwt, encode_jwt
import threading
from rest_framework_simplejwt.tokens import RefreshToken
from django.db import transaction
from rest_framework.decorators import action
from order.views import OrderModel
from product.views import ProductModel
from django.db.models import Sum
from order.views import OrderItemModel


class UserViewSet(ModelViewSet):
    queryset = UserModel.objects.all().order_by("-id")
    serializer_class = UserSerialzier
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    filter_backends = [SearchFilter, OrderingFilter]
    pagination_class = MyPagination

    search_fields = ["username", "email"]
    ordering_fields = [
        "id",
        "email",
        "username",
    ]

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        customOrdering = request.query_params.get("customOrdering")
        userStatus = request.query_params.get("userStatus")
        emailVerified = request.query_params.get("emailVerified")
        userType = request.query_params.get("userType")

        if userStatus is not None:
            queryset = queryset.filter(is_active=userStatus == "true")
        if customOrdering:
            queryset = queryset.order_by(f"{customOrdering}")
        if userType:
            print(userType)
            queryset = queryset.filter(user_type=userType)
        if emailVerified:
            queryset = queryset.filter(is_email_verified=emailVerified == "true")

        page = self.paginate_queryset(queryset=queryset)
        if page is not None:
            serializer = self.serializer_class(page, many=True)
            return self.get_paginated_response(serializer.data)

        else:
            serializer = self.serializer_class(queryset, many=True)
            if serializer.is_valid():
                return Response(
                    {"success": True, "data": serializer.data},
                    status=status.HTTP_200_OK,
                )

    def create(self, request, *args, **kwargs):
        user_data = json.loads(request.data.get("user_data", "{}"))
        profile_image = request.FILES.get("profile_image")
        user_data["profile_image"] = profile_image
        serializer = self.serializer_class(data=user_data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(
                {
                    "success": True,
                    "message": "Data Created Successfully",
                    "data": serializer.data,
                },
                status=status.HTTP_200_OK,
            )

        else:
            first_field, first_error_list = next(iter(serializer.errors.items()))
            first_error = (
                first_error_list[0]
                if isinstance(first_error_list, list)
                else first_error_list
            )
            return Response(
                {"success": "False", "error": first_error},
                status=status.HTTP_400_BAD_REQUEST,
            )

    def update(self, request, *args, **kwargs):
        user_instance = self.get_object()
        user_data = json.loads(request.data.get("user_data", "{}"))
        profile_image = request.FILES.get("profile_image")
        if profile_image:
            user_data["profile_image"] = profile_image
        serializer = self.serializer_class(user_instance, data=user_data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(
                {
                    "success": True,
                    "message": "Data Updated Successfully",
                    "data": serializer.data,
                },
                status=status.HTTP_200_OK,
            )

        else:
            first_field, first_error_list = next(iter(serializer.errors.items()))
            first_error = (
                first_error_list[0]
                if isinstance(first_error_list, list)
                else first_error_list
            )
            return Response(
                {"success": "False", "error": first_error},
                status=status.HTTP_400_BAD_REQUEST,
            )

    def retrieve(self, request, *args, **kwargs):
        user_instance = self.get_object()
        serializer = self.serializer_class(user_instance)
        return Response(
            {"success": True, "data": serializer.data}, status=status.HTTP_200_OK
        )

    @action(
        detail=False,
        methods=["POST"],
        url_path="get-single-user",
        permission_classes=[IsAuthenticated],
    )
    def get_single_user(self, request, *args, **kwargs):
        serializer = self.serializer_class(request.user)

        return Response(
            {"success": True, "data": serializer.data},
            status=status.HTTP_200_OK,
        )

    @action(
        detail=False,
        methods=["POST"],
        permission_classes=[IsAuthenticated],
        url_path="dashboard-summary-customer",
    )
    def dashboard_summary_customer(self, request, *args, **kwargs):
        user = request.user

        user_orders = OrderModel.objects.filter(
            user=user,
            payment_status="Paid",
        )

        total_spend = user_orders.aggregate(total=Sum("subtotal"))["total"] or 0

        total_orders = user_orders.count()

        total_products_purchased = (
            OrderItemModel.objects.filter(
                order__user=user,
                order__payment_status="Paid",
            )
            .values("product")
            .distinct()
            .count()
        )

        pending_orders = user_orders.filter(status="Pending").count()
        processing_orders = user_orders.filter(status="Processing").count()
        delivered_orders = user_orders.filter(status="Delivered").count()
        cancelled_orders = user_orders.filter(status="Cancelled").count()

        monthly_queryset = (
            user_orders.annotate(month=TruncMonth("created_at"))
            .values("month")
            .annotate(value=Sum("subtotal"))
            .order_by("month")
        )

        monthly_trends = {month_abbr[i]: 0 for i in range(1, 13)}

        for item in monthly_queryset:
            monthly_trends[month_abbr[item["month"].month]] = float(item["value"])

        monthly_trends = [
            {
                "month": month,
                "value": value,
            }
            for month, value in monthly_trends.items()
        ]

        data = {
            "total_orders": total_orders,
            "total_products_purchased": total_products_purchased,
            "total_spend": float(total_spend),
            "pending_orders": pending_orders,
            "processing_orders": processing_orders,
            "delivered_orders": delivered_orders,
            "cancelled_orders": cancelled_orders,
            "monthly_trends": monthly_trends,
        }

        return Response(
            {
                "success": True,
                "data": data,
            },
            status=status.HTTP_200_OK,
        )

    @action(
        detail=False,
        methods=["POST"],
        permission_classes=[IsAuthenticated],
        url_path="dashboard-summary-seller",
    )
    def dashboard_summary_seller(self, request, *args, **kwargs):
        user = request.user

        # Seller's Products
        user_products = ProductModel.objects.filter(user=user)

        # Only Paid Order Items
        user_order_items = OrderItemModel.objects.filter(
            product__user=user,
            order__payment_status="Paid",
        )

        # Revenue
        total_revenue = user_order_items.aggregate(total=Sum("subtotal"))["total"] or 0

        # Counts
        total_products = user_products.count()

        total_orders = user_order_items.values("order").distinct().count()

        pending_orders = (
            user_order_items.filter(order__status="Pending")
            .values("order")
            .distinct()
            .count()
        )

        processing_orders = (
            user_order_items.filter(order__status="Processing")
            .values("order")
            .distinct()
            .count()
        )

        delivered_orders = (
            user_order_items.filter(order__status="Delivered")
            .values("order")
            .distinct()
            .count()
        )

        cancelled_orders = (
            user_order_items.filter(order__status="Cancelled")
            .values("order")
            .distinct()
            .count()
        )

        # Monthly Revenue
        monthly_queryset = (
            user_order_items.annotate(month=TruncMonth("order__created_at"))
            .values("month")
            .annotate(value=Sum("subtotal"))
            .order_by("month")
        )

        monthly_trends = {month_abbr[i]: 0 for i in range(1, 13)}

        for item in monthly_queryset:
            monthly_trends[month_abbr[item["month"].month]] = float(item["value"])

        monthly_trends = [
            {
                "month": month,
                "value": value,
            }
            for month, value in monthly_trends.items()
        ]

        data = {
            "total_orders": total_orders,
            "total_products": total_products,
            "total_revenue": float(total_revenue),
            "pending_orders": pending_orders,
            "processing_orders": processing_orders,
            "delivered_orders": delivered_orders,
            "cancelled_orders": cancelled_orders,
            "monthly_trends": monthly_trends,
        }

        return Response(
            {
                "success": True,
                "data": data,
            },
            status=status.HTTP_200_OK,
        )

    @action(
        detail=False,
        methods=["POST"],
        permission_classes=[IsAuthenticated],
        url_path="dashboard-summary-admin",
    )
    def dashboard_summary_admin(self, request, *args, **kwargs):

        total_products = ProductModel.objects.count()
        paid_order_items = OrderItemModel.objects.filter(order__payment_status="Paid")
        total_revenue = paid_order_items.aggregate(total=Sum("subtotal"))["total"] or 0
        total_orders = OrderModel.objects.count()
        pending_orders = OrderModel.objects.filter(status="Pending").count()
        processing_orders = OrderModel.objects.filter(status="Processing").count()
        delivered_orders = OrderModel.objects.filter(status="Delivered").count()
        cancelled_orders = OrderModel.objects.filter(status="Cancelled").count()
        total_customers = UserModel.objects.filter(user_type="Customer").count()

        total_sellers = UserModel.objects.filter(user_type="Seller").count()

        monthly_queryset = (
            paid_order_items.annotate(month=TruncMonth("order__created_at"))
            .values("month")
            .annotate(value=Sum("subtotal"))
            .order_by("month")
        )

        monthly_trends = {month_abbr[i]: 0 for i in range(1, 13)}

        for item in monthly_queryset:
            monthly_trends[month_abbr[item["month"].month]] = float(item["value"])

        monthly_trends = [
            {
                "month": month,
                "value": value,
            }
            for month, value in monthly_trends.items()
        ]

        data = {
            "total_orders": total_orders,
            "total_products": total_products,
            "total_customers": total_customers,
            "total_sellers": total_sellers,
            "total_revenue": float(total_revenue),
            "pending_orders": pending_orders,
            "processing_orders": processing_orders,
            "delivered_orders": delivered_orders,
            "cancelled_orders": cancelled_orders,
            "monthly_trends": monthly_trends,
        }

        return Response(
            {
                "success": True,
                "data": data,
            },
            status=status.HTTP_200_OK,
        )


class LoginViewset(ModelViewSet):
    queryset = UserModel.objects.all()
    serializer_class = UserSerialzier

    @transaction.atomic
    def create(self, request, *args, **kwargs):
        data = request.data
        email = data.get("email")
        password = data.get("password")

        if not email:
            return Response(
                {"success": False, "error": "Email is required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not password:
            return Response(
                {"success": False, "error": "Password is required"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        try:
            user_instance = UserModel.objects.get(email=email)

        except UserModel.DoesNotExist:
            return Response(
                {"success": False, "error": "Email Invalid"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not check_password(password, user_instance.password):
            return Response(
                {"success": False, "error": "Invalid Password"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        print(user_instance.is_email_verified)
        if not user_instance.is_email_verified:
            return Response(
                {
                    "success": False,
                    "error": "User account is not verified, So register and verify Account",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        token = generate_tokens_for_user(user=user_instance)

        user_instance.is_active = True
        user_instance.save()

        return Response(
            {"success": True, "message": "Login Successfully done", "token": token},
            status=status.HTTP_200_OK,
        )


class RegisterViewset(ModelViewSet):
    queryset = UserModel.objects.all()
    serializer_class = UserSerialzier

    @transaction.atomic
    def create(self, request, *args, **kwargs):

        email = request.data.get("email")
        print(email)
        user_instance = UserModel.objects.filter(
            email=email, is_email_verified=False
        ).first()
        if user_instance:
            otp = generate_otp()
            user_instance.otp = otp
            user_instance.save()
            token = encode_jwt(email=user_instance.email)

            return Response(
                {"success": True, "otp": otp,"user_type":user_instance.user_type, "verification_token": token},
                status=status.HTTP_200_OK,
            )
        else:
            print(request.data)
            data = request.data
            print(data.get("email"))
            serilaizer = self.serializer_class(data=data)

            if serilaizer.is_valid():
                otp = generate_otp()
                serilaizer.validated_data["otp"] = otp
                user_instance = serilaizer.save()
                verification_token = encode_jwt(email=user_instance.email)
                context = {
                    "email": user_instance.email,
                    "username": user_instance.username,
                    "otp": otp,
                }

                send_email = threading.Thread(
                    target=send_template_email,
                    kwargs={
                        "subject": "Otp Verification",
                        "template_name": "OtpVerifyEmail.html",
                        "context": context,
                        "recipient_list": [user_instance.email],
                    },
                )
                send_email.start()

                return Response(
                    {
                        "success": True,
                        "user_type":user_instance.user_type,
                        "message": f"Otp Successfully Send to {user_instance.email}",
                        "verification_token": verification_token,
                    },
                    status=status.HTTP_200_OK,
                )
            else:
                print(serilaizer.errors)
                first_field, first_error_list = next(iter(serilaizer.errors.items()))
                first_error = (
                    first_error_list[0]
                    if isinstance(first_error_list, list)
                    else first_error_list
                )

                return Response(
                    {"success": False, "error": first_error},
                    status=status.HTTP_400_BAD_REQUEST,
                )


class OtpVerifyViewSet(ModelViewSet):
    queryset = UserModel.objects.all()
    serializer_class = UserSerialzier

    @transaction.atomic
    def create(self, request, *args, **kwargs):
        otp = request.data.get("otp")
        token = request.data.get("token")
        print(otp, token)

        if not otp:
            return Response(
                {"success": False, "error": "Otp is required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not token:
            return Response(
                {"success": False, "error": "Verification Token is required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            payload = decode_jwt(token=token)
        except:
            return Response(
                {"success": False, "error": "Token is expired"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not payload.get("email"):
            return Response(
                {"success": False, "error": "Invalid token"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user_instance = UserModel.objects.filter(
            email=payload.get("email"), otp=otp
        ).first()
        if not user_instance:
            return Response(
                {"success": False, "error": "Invalid Otp"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        token = generate_tokens_for_user(user_instance)
        user_instance.is_email_verified = True
        user_instance.is_active = True
        user_instance.save()

        return Response(
            {
                "success": True,
                "message": "Otp Verification Successfully Done",
                "token": token,
            },
            status=status.HTTP_200_OK,
        )


class ForgotPasswordViewset(ModelViewSet):
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        email = request.data.get("email")
        if not email:
            return Response(
                {"success": False, "error": "email is required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            user_instance = UserModel.objects.get(email=email, is_email_verified=True)
        except UserModel.DoesNotExist:
            return Response(
                {"success": False, "error": "User with this email does not exists "},
                status=status.HTTP_400_BAD_REQUEST,
            )

        verification_token = encode_jwt(user_instance.email)
        context = {
            "email": user_instance.email,
            "username": user_instance.username,
            "token": verification_token,
        }

        send_email = threading.Thread(
            target=send_template_email,
            kwargs={
                "subject": "Forgot Password",
                "template_name": "ForgotPasswordEmail.html",
                "context": context,
                "recipient_list": [user_instance.email],
            },
        )
        send_email.start()

        return Response(
            {
                "success": True,
                "message": f"Change Password Link has been send on {user_instance.email}",
                "token": verification_token,
            },
            status=status.HTTP_200_OK,
        )


class ChangePasswordViewset(ModelViewSet):
    @transaction.atomic
    def create(self, request, *args, **kwargs):
        token = request.data.get("token")
        password = request.data.get("password")
        password2 = request.data.get("password2")

        if not token:
            return Response(
                {"success": False, "error": "token is required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not password:
            return Response(
                {"success": False, "error": "password is required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if len(password) < 8 or len(password) > 14:
            return Response(
                {
                    "success": False,
                    "error": "password length should be between 8 to 14 ",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not password2:
            return Response(
                {"success": False, "error": "password2 is required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not password == password2:
            return Response(
                {"success": False, "error": "password and password2 is not macthing "},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            payload = decode_jwt(token=token)
        except:
            return Response(
                {"success": False, "error": "Token is expired "},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not payload.get("email"):
            return Response(
                {"success": False, "error": "Invalid token"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            user_instance = UserModel.objects.get(
                email=payload.get("email"), is_email_verified=True
            )
        except UserModel.DoesNotExist:
            return Response(
                {"success": False, "error": "No User found with the email"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        token = generate_tokens_for_user(user_instance)
        user_instance.set_password(password)
        user_instance.is_active = True
        user_instance.save()

        return Response(
            {
                "success": True,
                "message": "Password Change Successfully done",
                "token": token,
            },
            status=status.HTTP_200_OK,
        )


class ResetPasswordViewset(ModelViewSet):

    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    @transaction.atomic()
    def create(self, request, *args, **kwargs):
        user_instance = request.user
        old_password = request.data.get("old_password")
        new_password = request.data.get("new_password")
        confirm_password = request.data.get("confirm_password")

        if not old_password:
            return Response(
                {"success": False, "error": "old password is required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            user_instance = UserModel.objects.get(
                id=user_instance.id, is_email_verified=True
            )
        except UserModel.DoesNotExist:
            return Response(
                {"success": False, "error": "No User found"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not user_instance.check_password(old_password):
            return Response(
                {
                    "success": False,
                    "error": "Invalid old password",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not new_password:
            return Response(
                {"success": False, "error": "new password is required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if len(new_password) < 8 or len(new_password) > 14:
            return Response(
                {
                    "success": False,
                    "error": "new password length should be between 8 to 14 ",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        if new_password == old_password:
            return Response(
                {
                    "success": False,
                    "error": "new password should not similiar to old password",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not confirm_password:
            return Response(
                {"success": False, "error": "confirm_password is required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not new_password == confirm_password:
            return Response(
                {
                    "success": False,
                    "error": "new_password and confirm_password is not macthing ",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        user_instance.password
        user_instance.set_password(new_password)
        user_instance.is_active = True
        user_instance.save()
        context = {
            "email": user_instance.email,
            "username": user_instance.username,
        }

        send_email = threading.Thread(
            target=send_template_email,
            args=[
                {
                    "subject": "Reset Password",
                    "template_name": "ResetPasswordEmail.html",
                    "context": context,
                    "recipient_list": [user_instance.email],
                }
            ],
        )
        send_email.start()

        return Response(
            {"success": True, "message": "Password Reset Successfully Done"},
            status=status.HTTP_200_OK,
        )


class LogoutViewSet(ModelViewSet):

    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def create(self, request):
        refresh_token = request.data.get("refresh")
        if not refresh_token:
            return Response(
                {
                    "success": False,
                    "error": "Refresh token is required",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response(
                {
                    "success": True,
                    "message": "Logout successful",
                },
                status=status.HTTP_200_OK,
            )

        except Exception as e:
            print(e)

            return Response(
                {
                    "success": False,
                    "error": str(e),
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

class GoogleSocialAuthView(ModelViewSet):
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):

        code = request.data.get("code")
        temp_id = request.data.get("temp_id")
        user_type = request.data.get("user_type")
        print(temp_id)
        print(user_type)
        
        # ---------------------------------------------------
        # STEP 2 : CREATE USER FROM CACHE
        # ---------------------------------------------------
        if temp_id and user_type:
            
            google_data = cache.get(temp_id)

            if not google_data:
                return Response(
                    {
                        "success": False,
                        "message": "Google session expired. Please login again.",
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

            email = google_data["email"]
            first_name = google_data["first_name"]
            last_name = google_data["last_name"]
            picture = google_data["picture"]

            base_username = (
                f"{first_name} {last_name}".strip()
                or email.split("@")[0]
            )

            username = base_username

            while UserModel.objects.filter(username=username).exists():
                username = f"{base_username}_{uuid.uuid4().hex[:4]}"

            user = UserModel.objects.create(
                email=email,
                username=username,
                user_type=user_type,
                is_active=True,
                is_email_verified=True,
            )
            
            group = Group.objects.filter(name=user_type).first()

            if group:
                user.groups.add(group)

            if picture:
                try:
                    response = requests.get(picture, timeout=5)

                    if response.status_code == 200:
                        user.profile_image.save(
                            f"user_{user.id}.jpg",
                            ContentFile(response.content),
                            save=True,
                        )
                except requests.RequestException:
                    pass

            cache.delete(temp_id)

            refresh = RefreshToken.for_user(user)
            refresh["user_type"] = user.user_type

            return Response(
                {
                    "success": True,
                    "exists": False,
                    "token": {
                        "access": str(refresh.access_token),
                        "refresh": str(refresh),
                    },
                    "user": {
                        "email": user.email,
                        "username": user.username,
                        "picture": picture,
                        "user_type": user.user_type,
                    },
                    "message": "Account Successfully Created",
                }
            )

        # ---------------------------------------------------
        # STEP 1 : GOOGLE LOGIN
        # ---------------------------------------------------
        else:
            
            if not code:
                return Response(
                    {
                        "success": False,
                        "message": "Google authorization code is required.",
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

            token_response = requests.post(
                "https://oauth2.googleapis.com/token",
                data={
                    "code": code,
                    "client_id": config("GOOGLE_CLIENT_ID"),
                    "client_secret": config("GOOGLE_CLIENT_SECRET"),
                    "redirect_uri": "postmessage",
                    "grant_type": "authorization_code",
                },
            )

            token_data = token_response.json()

            if "error" in token_data:
                return Response(
                    {
                        "success": False,
                        "message": "Google verification failed.",
                        "details": token_data,
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

            access_token = token_data["access_token"]

            profile = requests.get(
                "https://www.googleapis.com/oauth2/v3/userinfo",
                headers={
                    "Authorization": f"Bearer {access_token}"
                },
            ).json()

            email = profile.get("email")
            first_name = profile.get("given_name", "")
            last_name = profile.get("family_name", "")
            picture = profile.get("picture", "")

            if not email:
                return Response(
                    {
                        "success": False,
                        "message": "Unable to retrieve Google email.",
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # Existing user -> Login immediately
            user = UserModel.objects.filter(email=email).first()

            if user:
                refresh = RefreshToken.for_user(user)
                refresh["user_type"] = user.user_type

                return Response(
                    {
                        "success": True,
                        "exists": True,
                        "token": {
                            "access": str(refresh.access_token),
                            "refresh": str(refresh),
                        },
                        "user": {
                            "email": user.email,
                            "username": user.username,
                            "picture": picture,
                            "user_type": user.user_type,
                        },
                        "message": "Login Successfully Done",
                    }
                )

            # New user -> Store Google profile temporarily
            temp_id = str(uuid.uuid4())

            cache.set(
                temp_id,
                {
                    "email": email,
                    "first_name": first_name,
                    "last_name": last_name,
                    "picture": picture,
                },
                timeout=600,
            )

            return Response(
                {
                    "success": True,
                    "exists": False,
                    "temp_id": temp_id,
                    "message": "Please select account type.",
                }
            )
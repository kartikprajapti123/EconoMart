from rest_framework.routers import DefaultRouter
from user.views import LoginViewset,RegisterViewset,ResetPasswordViewset,ChangePasswordViewset,UserViewSet,ForgotPasswordViewset,LogoutViewSet,OtpVerifyViewSet,GoogleSocialAuthView
from master.views import CountryViewset,StateViewset,CityViewSet
from product.views import ProductBrandViewSet,ProductColorViewSet,ProductSizeViewSet,ProductViewSet
from order.views import OrderViewSet,OrderItemViewSet
from support_request.views import SupportTicketMessageViewSet,SupportTicketViewSet
from notification.views import NotificationViewSet
from chat.views import ChatViewSet,ChatMessageViewSet

router=DefaultRouter()

# auth
router.register("user",UserViewSet,basename="user")
router.register("login",LoginViewset,basename="login")
router.register("register",RegisterViewset,basename="register")
router.register("otp-verify",OtpVerifyViewSet,basename="oty-verify")
router.register("logout",LogoutViewSet,basename="logout")
router.register("forgot-password",ForgotPasswordViewset,basename="forgot-password")
router.register("change-password",ChangePasswordViewset,basename="change-password")
router.register("reset-password",ResetPasswordViewset,basename="reset-password")

router.register("country",CountryViewset,basename="country")
router.register("state",StateViewset,basename="state")
router.register("city",CityViewSet,basename="city")

#product
router.register("product",ProductViewSet,basename="product")
router.register("product-size",ProductSizeViewSet,basename="product-size")
router.register("product-brand",ProductBrandViewSet,basename="product-brand")
router.register("product-color",ProductColorViewSet,basename="product-color")


router.register("order",OrderViewSet,basename="order")
router.register("order-item",OrderItemViewSet,basename="order-item")

router.register("google-authentication",GoogleSocialAuthView,basename="google-authentication")


router.register("support-ticket",SupportTicketViewSet,basename="support-ticket")
router.register("support-ticket-message",SupportTicketMessageViewSet,basename="support-ticket-message")
router.register("notification",NotificationViewSet,basename="notification")


router.register("chat",ChatViewSet,basename="chat")
router.register("chat-message",ChatMessageViewSet,basename="chat-message")




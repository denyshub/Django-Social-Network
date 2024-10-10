from django.contrib import admin
from django.conf import settings
from django.conf.urls.static import static
from django.urls import path, include
from rest_framework import routers
from rest_framework_simplejwt.views import TokenRefreshView, TokenObtainPairView

from chats.views import ChatViewSet, MessageViewSet
from posts.serializers import LikesSerializer
from posts.views import *
from users.views import UserRegistrationView, ProfileViewSet

router = routers.DefaultRouter()
router.register(r"posts", PostViewSet, basename="posts")
router.register(r"tags", TagViewSet, basename="tags")
router.register(r"comments", CommentViewSet, basename="comments")
router.register(r"profiles", ProfileViewSet, basename="profiles")
router.register(r"likes", LikesViewSet, basename="likes")
router.register(r"chats", ChatViewSet, basename="chats")
router.register(r"messages", MessageViewSet, basename="messages")


urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/v1/", include(router.urls)),
    path("api/v1/token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/v1/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("api/v1/register/", UserRegistrationView.as_view(), name="register"),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

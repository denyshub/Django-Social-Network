from django.shortcuts import render
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.response import Response

from rest_framework import status, viewsets, generics
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import IsAuthenticated

from posts.models import Post
from posts.serializers import PostSerializer
from users.models import Profile
from users.serializers import ProfileSerializer, UserRegistrationSerializer


class UserRegistrationView(generics.CreateAPIView):
    serializer_class = UserRegistrationSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response({"user_id": user.id}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# Create your views here.
class ProfileViewSet(viewsets.ModelViewSet):
    queryset = Profile.objects.all()
    serializer_class = ProfileSerializer
    filter_backends = (DjangoFilterBackend,)

    # permission_classes = [IsAuthenticated]

    def get_object(self):
        pk = self.kwargs.get("pk")  # Отримуємо pk з URL

        # Перевіряємо, чи передано pk
        if pk:
            try:
                # Пошук профілю за pk
                profile = Profile.objects.get(pk=pk)
            except Profile.DoesNotExist:
                raise NotFound("Profile not found.")
        else:
            # Якщо pk не передано, шукаємо профіль поточного користувача
            user = self.request.user
            profile, created = Profile.objects.get_or_create(user=user)

        return profile

    def retrieve(self, request, *args, **kwargs):
        # Отримуємо профіль, автоматично створюючи його, якщо він відсутній
        profile = self.get_object()

        # Отримуємо користувача через профіль
        user = profile.user

        # Отримуємо пости, пов'язані з користувачем
        posts = Post.objects.filter(author=user)

        # Серіалізуємо дані профілю та постів
        profile_data = self.get_serializer(profile).data
        posts_data = PostSerializer(posts, many=True).data

        return Response(
            {
                "profile": profile_data,
                "posts": posts_data,
            }
        )

    def update(self, request, *args, **kwargs):
        # Отримуємо профіль за ID або створюємо, якщо він відсутній
        profile = self.get_object()
        if request.user != profile.user:
            return Response(
                {"detail": "You cannot change this profile."},
                status=status.HTTP_403_FORBIDDEN,
            )
        return super().update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        # Отримуємо профіль за ID
        profile = self.get_object()
        if request.user != profile.user and not request.user.is_staff:
            raise PermissionDenied("You cannot delete this profile.")
        self.perform_destroy(profile)
        return Response(status=status.HTTP_204_NO_CONTENT)

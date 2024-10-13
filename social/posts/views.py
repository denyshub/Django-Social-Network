import django_filters
from rest_framework import viewsets
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from .mixins import AuthorStaffPermissionMixin
from .models import Post, Tag, Comment, Like
from .serializers import (
    PostSerializer,
    TagsSerializer,
    CommentsSerializer,
    LikesSerializer,
)


class TagViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = TagsSerializer
    queryset = Tag.objects.all()


class CommentViewSet(AuthorStaffPermissionMixin, viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = CommentsSerializer
    queryset = Comment.objects.all()

    def update(self, request, *args, **kwargs):
        comment = self.get_object()

        self.check_author(request.user, comment)

        # Оновлення поля is_edited
        comment.is_edited = True
        comment.save()

        # Виклик базового методу update
        serializer = self.get_serializer(comment, data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)

        return Response(serializer.data)

    def destroy(self, request, *args, **kwargs):
        comment = self.get_object()

        # Перевірка, чи є користувач автором коментаря
        if request.user != comment.author and not request.user.is_staff:
            raise PermissionDenied("You cannot delete this comment.")

        self.perform_destroy(comment)
        return Response(status=status.HTTP_204_NO_CONTENT)


class LikesViewSet(AuthorStaffPermissionMixin, viewsets.ModelViewSet):
    queryset = Like.objects.all()
    serializer_class = LikesSerializer
    permission_classes = [IsAuthenticated]

    def destroy(self, request, *args, **kwargs):
        like = self.get_object()

        # Перевірка, чи є користувач автором коментаря
        self.check_author(request.user, like)

        self.perform_destroy(like)
        return Response(status=status.HTTP_204_NO_CONTENT)


class PostViewSet(AuthorStaffPermissionMixin, viewsets.ModelViewSet):
    search = django_filters.CharFilter(field_name="text", lookup_expr="icontains")
    tag = django_filters.CharFilter(field_name="tags__name", lookup_expr="iexact")
    serializer_class = PostSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        pk = self.kwargs.get("pk")
        if not pk:
            return Post.objects.prefetch_related("comments").all()
        return Post.objects.filter(pk=pk)

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

    def update(self, request, *args, **kwargs):
        post = self.get_object()
        self.check_author(request.user, post)
        return super().update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        post = self.get_object()

        # Перевірка, чи є користувач автором коментаря
        self.check_author(request.user, post)
        self.check_is_staff(request.user)

        self.perform_destroy(post)
        return Response(status=status.HTTP_204_NO_CONTENT)

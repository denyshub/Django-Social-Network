import django_filters
from django.contrib.auth import get_user_model
from django.shortcuts import get_object_or_404
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import viewsets, generics
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

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


class CommentViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = CommentsSerializer
    queryset = Comment.objects.all()

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop("partial", False)
        comment = self.get_object()

        if request.user != comment.author:
            raise PermissionDenied("You cannot edit this comment.")

        # Оновлення поля is_edited
        comment.is_edited = True
        comment.save()

        # Виклик базового методу update
        serializer = self.get_serializer(comment, data=request.data, partial=partial)
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


class LikesViewSet(viewsets.ModelViewSet):
    queryset = Like.objects.all()
    serializer_class = LikesSerializer

    def destroy(self, request, *args, **kwargs):
        like = self.get_object()

        # Перевірка, чи є користувач автором коментаря
        if request.user != like.author:
            raise PermissionDenied("You cannot delete this like.")

        self.perform_destroy(like)
        return Response(status=status.HTTP_204_NO_CONTENT)


class PostViewSet(viewsets.ModelViewSet):
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
        if request.user != post.author:
            return Response(
                {"detail": "You cannot change this post."},
                status=status.HTTP_403_FORBIDDEN,
            )
        return super().update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        post = self.get_object()

        # Перевірка, чи є користувач автором коментаря
        if request.user != post.author and not request.user.is_staff:
            raise PermissionDenied("You cannot delete this post.")

        self.perform_destroy(post)
        return Response(status=status.HTTP_204_NO_CONTENT)

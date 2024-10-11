from django.contrib.auth import get_user_model
from django.shortcuts import render
from rest_framework.response import Response
from rest_framework import viewsets, status
from rest_framework.exceptions import ValidationError
from rest_framework.permissions import IsAuthenticated

from chats.models import Chat, Message
from chats.serializers import ChatSerializer, MessageSerializer


# Create your views here.


class ChatViewSet(viewsets.ModelViewSet):
    serializer_class = ChatSerializer
    permission_classes = [IsAuthenticated]
    queryset = Chat.objects.all()

    def perform_create(self, serializer):
        # Отримати учасників з даних запиту
        participants = self.request.data.get("participants", [])

        # Додаємо поточного користувача до списку учасників, якщо його там немає
        if self.request.user.id not in participants:
            participants.append(self.request.user.id)

        # Перевірка, чи є принаймні двоє учасників
        if len(participants) < 2:
            raise ValidationError(
                {"detail": "A chat must have at least two participants."}
            )

        # Отримати імена учасників
        User = get_user_model()
        participant_users = User.objects.filter(id__in=participants)
        participant_names = [user.username for user in participant_users]

        # Формуємо заголовок чату
        title = ", ".join(participant_names)  # Якщо кілька учасників

        # Зберігаємо чат з учасниками
        serializer.save(participants=participant_users, title=title)

    def update(self, request, *args, **kwargs):
        chat = self.get_object()
        if not chat.participants.filter(id=request.user.id).exists():
            return Response(
                {"detail": "You cannot change this chat."},
                status=status.HTTP_403_FORBIDDEN,
            )
        return super().update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        chat = self.get_object()
        if not chat.participants.filter(id=request.user.id).exists():
            return Response(
                {"detail": "You cannot delete this chat."},
                status=status.HTTP_403_FORBIDDEN,
            )
        self.perform_destroy(chat)
        return Response(status=status.HTTP_204_NO_CONTENT)

    def retrieve(self, request, *args, **kwargs):
        """Отримати чат лише якщо користувач є його учасником"""
        chat = self.get_object()

        # Перевірка, чи є користувач учасником цього чату
        if not chat.participants.filter(id=request.user.id).exists():
            return Response(
                {"detail": "You cannot view this chat."},
                status=status.HTTP_403_FORBIDDEN,
            )

        return super().retrieve(request, *args, **kwargs)

    def list(self, request, *args, **kwargs):
        """Отримати список чатів, де користувач є учасником"""
        queryset = self.queryset.filter(participants=request.user)

        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


class MessageViewSet(viewsets.ModelViewSet):
    serializer_class = MessageSerializer
    permission_classes = [IsAuthenticated]
    queryset = Message.objects.all()

from django.contrib.auth import get_user_model
from rest_framework.response import Response
from rest_framework import viewsets, status
from rest_framework.exceptions import ValidationError
from rest_framework.permissions import IsAuthenticated

from chats.models import Chat, Message
from chats.serializers import ChatSerializer, MessageSerializer


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

        # Перевірка, чи передана назва чату
        title = self.request.data.get("title")
        if not title:  # Якщо назва не передана, формуємо заголовок з учасників
            title = ", ".join(participant_names)

        # Зберігаємо чат з учасниками та заголовком
        serializer.save(participants=participant_users, title=title)

    def check_participant(self, chat):
        """Перевірка, чи є користувач учасником чату."""
        if not chat.participants.filter(id=self.request.user.id).exists():
            raise ValidationError({"detail": "You cannot access this chat."})

    def update(self, request, *args, **kwargs):
        chat = self.get_object()
        self.check_participant(chat)  # Використовуємо новий метод
        return super().update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        chat = self.get_object()
        self.check_participant(chat)  # Використовуємо новий метод
        self.perform_destroy(chat)
        return Response(status=status.HTTP_204_NO_CONTENT)

    def retrieve(self, request, *args, **kwargs):
        """Отримати чат лише якщо користувач є його учасником"""
        chat = self.get_object()
        self.check_participant(chat)  # Використовуємо новий метод
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

    def perform_create(self, serializer):
        # Додаємо автора повідомлення
        serializer.save(author=self.request.user)

    def check_author(self, message):
        """Перевірка, чи є користувач автором повідомлення."""
        if message.author != self.request.user:
            raise ValidationError({"detail": "You cannot change this message."})

    def update(self, request, *args, **kwargs):
        message = self.get_object()
        self.check_author(message)  # Використовуємо новий метод
        return super().update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        message = self.get_object()
        self.check_author(message)  # Використовуємо новий метод
        self.perform_destroy(message)
        return Response(status=status.HTTP_204_NO_CONTENT)

    def list(self, request, *args, **kwargs):
        """Отримати список повідомлень для певного чату"""
        chat_id = self.kwargs.get("chat_id")
        queryset = self.queryset.filter(chat_id=chat_id)

        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

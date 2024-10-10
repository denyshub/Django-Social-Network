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
        participants.append(self.request.user.id)

        # Перевірка, чи є принаймні двоє учасників
        if len(participants) < 2:
            raise ValidationError(
                {"detail": "A chat must have at least two participants."}
            )

        # Якщо перевірка пройдена, зберегти чат
        serializer.save(author=self.request.user, participants=participants)

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
        if request.user not in chat.participants:
            return Response(
                {"detail": "You cannot delete this chat."},
                status=status.HTTP_403_FORBIDDEN,
            )
        self.perform_destroy(chat)
        return Response(status=status.HTTP_204_NO_CONTENT)


class MessageViewSet(viewsets.ModelViewSet):
    serializer_class = MessageSerializer
    permission_classes = [IsAuthenticated]
    queryset = Message.objects.all()

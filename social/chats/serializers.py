from django.contrib.auth import get_user_model
from rest_framework import serializers

from chats.models import Chat, Message


class MessageSerializer(serializers.ModelSerializer):
    author = serializers.HiddenField(default=serializers.CurrentUserDefault())

    class Meta:
        model = Message
        fields = "__all__"


class ChatSerializer(serializers.ModelSerializer):
    messages = MessageSerializer(many=True)
    participants = serializers.PrimaryKeyRelatedField(
        many=True, queryset=get_user_model().objects.all()
    )

    class Meta:
        model = Chat
        fields = "__all__"

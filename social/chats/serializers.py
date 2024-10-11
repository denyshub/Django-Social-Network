from django.contrib.auth import get_user_model
from rest_framework import serializers
from chats.models import Chat, Message

User = get_user_model()


class MessageSerializer(serializers.ModelSerializer):
    author = serializers.HiddenField(default=serializers.CurrentUserDefault())
    author_name = serializers.CharField(source="author.username", read_only=True)

    class Meta:
        model = Message
        fields = "__all__"


class ChatSerializer(serializers.ModelSerializer):
    messages = MessageSerializer(many=True, read_only=True)
    participants = serializers.PrimaryKeyRelatedField(
        many=True, queryset=User.objects.all()
    )
    participant_names = serializers.SerializerMethodField()

    class Meta:
        model = Chat
        fields = "__all__"

    def validate_participants(self, participants):
        if len(participants) < 1:
            raise serializers.ValidationError("At least one participant is required.")
        return participants

    def get_participant_names(self, obj):
        return [user.username for user in obj.participants.all()]

from django.contrib.auth import get_user_model
from django.db import models


class Chat(models.Model):
    participants = models.ManyToManyField(get_user_model(), related_name="chats")
    created_at = models.DateTimeField(auto_now_add=True)
    image = models.ImageField(
        "Зображення", upload_to="chat_avatars/", null=True, blank=True
    )

    class Meta:
        verbose_name = "Чат"
        verbose_name_plural = "Чати"

    def __str__(self):
        return f"Чат {self.id} з {self.participants.count()} учасниками"


class Message(models.Model):
    chat = models.ForeignKey(Chat, related_name="messages", on_delete=models.CASCADE)
    author = models.ForeignKey(
        get_user_model(), related_name="messages_sent", on_delete=models.CASCADE
    )
    recipient = models.ForeignKey(
        get_user_model(), related_name="messages_received", on_delete=models.CASCADE, null=True
    )
    text = models.CharField(max_length=1500)
    is_published = models.BooleanField(default=True)
    time_create = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Повідомлення"
        verbose_name_plural = "Повідомлення"
        ordering = ["-time_create"]

    def __str__(self):
        return (
            f"Повідомлення від {self.author} до {self.recipient} у чаті {self.chat.id}"
        )

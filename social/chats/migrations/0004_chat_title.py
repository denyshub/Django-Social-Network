# Generated by Django 5.1 on 2024-10-11 09:38

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("chats", "0003_message_is_edited"),
    ]

    operations = [
        migrations.AddField(
            model_name="chat",
            name="title",
            field=models.CharField(blank=True, max_length=100),
        ),
    ]

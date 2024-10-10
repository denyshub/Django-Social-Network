from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.contrib.auth.models import User

from posts.models import Post, Tag, Comment


@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "text",
        "author",
        "time_create",
    )  # Поля, які відображатимуться в списку
    search_fields = ("text", "content")  # Поля, за якими можна буде шукати
    list_filter = ("author", "time_create")  # Фільтри для списку
    ordering = ("-time_create",)  # Сортування за датою створення, нові зверху


@admin.register(Tag)
class TagAdmin(admin.ModelAdmin):
    list_display = ("id", "title", "slug")
    readonly_fields = ("id",)
    search_fields = ("title", "slug")


@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ("id", "post", "text", "author")
    readonly_fields = ("id", "author")

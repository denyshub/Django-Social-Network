from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.contrib.auth.models import User

from users.models import Profile


# Register your models here.
@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "user",
        "date_of_birth",
        "bio",
        "profile_picture",
        "location",
        "website",
    )
    readonly_fields = ("user",)


class CustomUserAdmin(UserAdmin):
    # Додаємо поле id в список полів, які будуть відображатися в адмінці
    list_display = ("id", "username", "email", "first_name", "last_name", "is_staff")


# Перереєструємо UserAdmin з нашими змінами
admin.site.unregister(User)
admin.site.register(User, CustomUserAdmin)

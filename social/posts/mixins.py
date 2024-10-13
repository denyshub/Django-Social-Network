from rest_framework.exceptions import PermissionDenied


class AuthorStaffPermissionMixin:
    def check_author(self, user, obj):
        """Перевіряє, чи є користувач автором об'єкта."""
        if user != obj.author:
            raise PermissionDenied("You are not the author of this object.")

    def check_is_staff(self, user):
        """Перевіряє, чи є користувач адміністратором або членом персоналу."""
        if not user.is_staff:
            raise PermissionDenied("You do not have the required permissions.")

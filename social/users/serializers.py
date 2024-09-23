from django.contrib.auth.models import User
from rest_framework import serializers

from users.models import Profile


class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    password_confirm = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ["username", "email", "password", "password_confirm"]

    def validate(self, attrs):
        if attrs["password"] != attrs["password_confirm"]:
            raise serializers.ValidationError({"password": "Passwords must match."})
        return attrs

    def create(self, validated_data):
        validated_data.pop("password_confirm")
        user = User.objects.create_user(**validated_data)

        return user


class ProfileSerializer(serializers.ModelSerializer):
    name = serializers.CharField(source="user.username", read_only=True)
    user = serializers.HiddenField(default=serializers.CurrentUserDefault())
    email = serializers.EmailField(source="user.email", read_only=True)

    class Meta:
        model = Profile
        fields = [
            "id",
            "user",
            "name",
            "bio",
            "email",
            "profile_picture",
            "location",
            "website",
            "date_of_birth",
        ]

from django.contrib.auth import get_user_model
from django.db import models


class Profile(models.Model):
    user = models.OneToOneField(get_user_model(), on_delete=models.CASCADE)
    bio = models.TextField("Bio", blank=True)
    profile_picture = models.ImageField(
        "Profile Picture", upload_to="profile_pictures/", null=True, blank=True
    )
    location = models.CharField(max_length=255, null=True, blank=True)
    website = models.URLField("Website", blank=True)
    date_of_birth = models.DateField("Date of Birth", null=True, blank=True)

    def __str__(self):
        return f"{self.user.username}'s Profile"

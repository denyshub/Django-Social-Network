from django.contrib.auth import get_user_model
from django.core.validators import MinLengthValidator, MaxLengthValidator
from django.db import models
from django.template.defaultfilters import slugify
from transliterate import translit

class Post(models.Model):
    image = models.ImageField(
        "Зображення", upload_to="post_images/", null=True, blank=True
    )
    text = models.TextField(
        "Текст",
        null=True,
        blank=True,
        validators=[
            MinLengthValidator(1),  # Мінімальна довжина 10 символів
            MaxLengthValidator(5000),  # Максимальна довжина 5000 символів
        ]
    )
    author = models.ForeignKey(get_user_model(), on_delete=models.CASCADE, null=True)
    time_create = models.DateTimeField(auto_now_add=True, verbose_name="Дата створення")
    is_published = models.BooleanField(default=True)
    location = models.CharField(
        max_length=255,
        null=True,
        blank=True,
        validators=[
            MaxLengthValidator(255),  # Максимальна довжина 255 символів
        ]
    )
    tags = models.ManyToManyField("Tag", related_name="posts")
    likes_num = models.IntegerField("К-ть лайків", default=0)
    comments_num = models.IntegerField("К-ть коментарів", default=0)

    class Meta:
        db_table = "posts_post"

    def __str__(self):
        return self.text or 'Без тексту'


class Tag(models.Model):
    title = models.CharField(max_length=100, db_index=True)
    slug = models.SlugField(max_length=255, unique=True, db_index=True)

    def __str__(self):
        return self.title

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(translit(self.title, language_code="en", reversed=True))
        super().save(*args, **kwargs)


class Comment(models.Model):
    author = models.ForeignKey(
        get_user_model(),
        on_delete=models.SET_NULL,
        related_name="comments",
        null=True,
        default=None,
    )
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name="comments")
    text = models.TextField(
        "Текст",

        validators=[
            MinLengthValidator(1),  # Мінімальна довжина 1 символ
            MaxLengthValidator(1000),  # Максимальна довжина 1000 символів
        ]
    )
    time_create = models.DateTimeField(auto_now_add=True, verbose_name="Дата створення")
    is_edited = models.BooleanField(default=False)  # Змінено за замовчуванням на False


class Like(models.Model):
    author = models.ForeignKey(
        get_user_model(),
        on_delete=models.SET_NULL,
        related_name="likes",
        null=True,
        default=None,
    )
    post = models.ForeignKey(
        Post,
        on_delete=models.CASCADE,
        related_name="likes"
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("author", "post")  # Ensure a user can like a post only once

    def __str__(self):
        return f"{self.author.username if self.author else 'Anonymous'} liked {self.post.id}"

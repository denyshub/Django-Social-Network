from rest_framework import serializers
from posts.models import Post, Tag, Comment, Like


class CommentsSerializer(serializers.ModelSerializer):
    author = serializers.HiddenField(default=serializers.CurrentUserDefault())
    author_name = serializers.CharField(source="author.username", read_only=True)
    post = serializers.PrimaryKeyRelatedField(queryset=Post.objects.all(), write_only=True)

    class Meta:
        model = Comment
        fields = "__all__"
        read_only_fields = ["id", "is_edited"]


class LikesSerializer(serializers.ModelSerializer):
    author = serializers.HiddenField(default=serializers.CurrentUserDefault())
    post = serializers.PrimaryKeyRelatedField(queryset=Post.objects.all(), write_only=True)

    class Meta:
        model = Like
        fields = "__all__"
        read_only_fields = ["created_at"]


class PostSerializer(serializers.ModelSerializer):
    author = serializers.HiddenField(default=serializers.CurrentUserDefault())
    author_name = serializers.CharField(source="author.username", read_only=True)
    author_profile_id = serializers.CharField(source="author.profile.id", read_only=True)
    author_profile_picture = serializers.ImageField(
        source="author.profile.profile_picture", read_only=True
    )
    comments_num = serializers.SerializerMethodField()
    likes_num = serializers.SerializerMethodField()
    likes = LikesSerializer(many=True, read_only=True)
    read_only_fields = ["author"]
    comments = CommentsSerializer(many=True, read_only=True)

    class Meta:
        model = Post
        fields = "__all__"

    @staticmethod
    def get_comments_num(obj):
        return obj.comments.count()

    @staticmethod
    def get_likes_num(obj):
        return obj.likes.count()


class TagsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = "__all__"



from rest_framework import serializers
from .models import *
from django.contrib.auth import get_user_model
import re
import math
import logging
from django.core.exceptions import ValidationError
User = get_user_model()

logger = logging.getLogger(__name__)

class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def to_representation(self, instance):
        #Убираем пароль при возврате данных
        rep = super().to_representation(instance)
        rep.pop('password', None)
        return rep

class RegisterSerializer(serializers.ModelSerializer):
    is_admin = serializers.BooleanField(required=False)

    class Meta:
        model = User
        fields = ['id', 'email', 'username', 'fullname', 'password', 'is_admin', 'is_staff', 'is_superuser']
        extra_kwargs = {
            'password': {'write_only': True},
            'is_staff': {'read_only': True},
            'is_superuser': {'read_only': True},
        }

    def validate_email(self, value):
        if not value:
            raise serializers.ValidationError("Введите email")

        if not re.match(r"[^@]+@[^@]+\.[^@]+", value):
            raise serializers.ValidationError("Поле ожидает адрес электронной почты")

        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Пользователь с таким email уже существует")

        return value

    def validate_username(self, value):
        if not value:
            raise serializers.ValidationError("Введите логин")

        if not re.match(r"^[A-Za-z][A-Za-z0-9]{3,19}$", value):
            raise serializers.ValidationError(
                "Username должен начинаться с буквы и содержать только латинские буквы и цифры (4–20 символов)"
            )

        return value

    def validate_password(self, value):
        if not value:
            raise serializers.ValidationError("Введите пароль")

        if len(value) < 6:
            raise serializers.ValidationError("Пароль должен содержать минимум 6 символов")

        if not re.search(r"[A-Z]", value):
            raise serializers.ValidationError("Пароль должен содержать хотя бы одну заглавную букву")

        if not re.search(r"[0-9]", value):
            raise serializers.ValidationError("Пароль должен содержать хотя бы одну цифру")

        if not re.search(r"[!@#$%^&*(),.?\":;{}|<>+]", value):
            raise serializers.ValidationError("Пароль должен содержать хотя бы один спецсимвол")

        return value

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        is_admin_val = validated_data.pop('is_admin', None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        if is_admin_val is not None:
            instance.is_admin = is_admin_val
            instance.is_staff = is_admin_val
            instance.is_superuser = is_admin_val

        if password:
            instance.set_password(password)

        instance.save()
        return instance
    
class UserFileSerializer(serializers.ModelSerializer):
    def validate_file(self, file):
        allowed = [
            "application/pdf",
            "image/jpeg",
            "image/png",
            "image/webp",
            "application/zip",
            "application/x-zip-compressed",
        ]

        if file.content_type not in allowed:
            raise serializers.ValidationError("Этот формат файла запрещён")

        return file

    class Meta:
        model = UserFile
        fields = '__all__'
        read_only_fields = ['user', 'size', 'uploaded_at', 'last_downloaded']
        
# список юзеров в админке
def convert_size(size_bytes):
    if size_bytes == 0:
        return "0 B"

    size_name = ('B', 'KB', 'MB', 'GB')
    i = int(math.floor(math.log(size_bytes, 1024)))
    s = round(size_bytes / math.pow(1024, i), 1)
    return f"{s} {size_name[i]}"

class UserListSerializer(serializers.ModelSerializer):
    total_files = serializers.SerializerMethodField()
    total_size = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ["id", "email", "username", "fullname", "is_admin", "total_files", "total_size"]

    def get_total_files(self, obj):
        count = UserFile.objects.filter(user=obj).count()
        return count if count > 0 else "Нет файлов"
    
    def get_total_size(self, obj):
        result=(UserFile.objects.filter(user=obj).aggregate(
            total=models.Sum("size"))["total"] or 0)
        return convert_size(result)
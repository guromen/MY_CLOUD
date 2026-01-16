from django.db import models
from django.contrib.auth.models import AbstractUser
from django.contrib.auth.base_user import BaseUserManager
from django.dispatch import receiver
import os
import uuid
from django.conf import settings
import logging

logger = logging.getLogger(__name__)

class CustomUserManager(BaseUserManager): 
    def create_user(self, email, password=None, **extra_fields ): 
        if not email: 
            raise ValueError('Email - обязательное поле')
        
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self,email, password=None, **extra_fields): 
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_admin', True) 
        return self.create_user(email, password, **extra_fields)

class CustomUser(AbstractUser):
    email = models.EmailField(max_length=200, unique=True)
    fullname = models.CharField(max_length=100,null=True, blank=True)
    username = models.CharField(max_length=100, null=True, blank=True)
    is_admin = models.BooleanField(default=False)

    objects = CustomUserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    def save(self, *args, **kwargs):
        new_user = self.pk is None
        if self.is_admin:
            self.is_staff = True
            self.is_superuser = True
        super().save(*args, **kwargs)
        if new_user:
            logger.info(f"[USER CREATED] Создан новый пользователь: {self.email}")
        else:
            logger.info(f"[ADMIN SET] Пользователь {self.email}: изменены права администратора на {self.is_admin}")

#модель файла
def user_directory_path(instance, filename):
    username = instance.user.username or instance.user.email.split('@')[0] 
    return f'user_files/{username}/{filename}'

class UserFile(models.Model):
    user = models.ForeignKey('users.CustomUser', on_delete=models.CASCADE, related_name='files')
    file = models.FileField(upload_to=user_directory_path) 
    comment = models.CharField(max_length=255, blank=True, null=True)
    size = models.PositiveIntegerField(default=0)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    last_downloaded = models.DateTimeField(blank=True, null=True)
    name = models.CharField(max_length=255, blank=True, null=True)
    public_uid = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    public_access_enabled = models.BooleanField(default=False)
    public_access_expires = models.DateTimeField(null=True, blank=True)
    download_count = models.PositiveIntegerField(default=0)

    def save(self, *args, **kwargs):
        new_object = self.pk is None
        if self.file and not self.size:
            self.size = self.file.size
            logger.info(f"[SIZE] Файл {self.file.name} — size={self.size} bytes")
        if not self.name:
            self.name = self.file.name
            logger.info(f"[NAME] Имя файла установлено {self.name}")
            
        super().save(*args, **kwargs)

        if new_object:
            logger.info(f"[UPLOAD] Новый файл от {self.user.email}: {self.file.name}")
            logger.info(f"[LINK] Публичная ссылка создана: {self.public_link}")

    @property
    def public_link(self):
        return f"{settings.FRONTEND_URL.rstrip('/')}/share/{self.public_uid}"

    def __str__(self):
        return self.name or "Unnamed file"
    
    #удаляем файл с диска если объект UserFile был удалён.
@receiver(models.signals.post_delete, sender=UserFile)
def auto_delete_file_on_delete(sender, instance, **kwargs):
    if instance.file and os.path.isfile(instance.file.path):
        os.remove(instance.file.path)
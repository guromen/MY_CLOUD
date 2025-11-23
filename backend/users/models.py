from django.db import models
from django.contrib.auth.models import AbstractUser
from django.contrib.auth.base_user import BaseUserManager


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
        if self.is_admin:
            self.is_staff = True
            self.is_superuser = True
        else:
            self.is_staff = False
            self.is_superuser = False
        super().save(*args, **kwargs)

#модель файла
# from django.conf import settings
def user_directory_path(instance, filename):
    username = instance.user.username or instance.user.email.split('@')[0] #имя файла-если нет username
    return f'user_files/{username}/{filename}'

class UserFile(models.Model):
    user = models.ForeignKey('users.CustomUser', on_delete=models.CASCADE, related_name='files')
    file = models.FileField(upload_to=user_directory_path) #имя файла если нет username
    comment = models.CharField(max_length=255, blank=True, null=True)
    size = models.PositiveIntegerField(default=0)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    last_downloaded = models.DateTimeField(blank=True, null=True)
    name = models.CharField(max_length=255, blank=True, null=True)

    def save(self, *args, **kwargs):
        if self.file and not self.size:
            self.size = self.file.size
        if not self.name:
            self.name = self.file.name
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name or "Unnamed file"
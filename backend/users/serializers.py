from rest_framework import serializers
from .models import *
from django.contrib.auth import get_user_model

User = get_user_model()

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

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user
    
    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        is_admin_val = validated_data.pop('is_admin', None)  # достаем отдельно

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
    class Meta:
        model = UserFile
        fields = '__all__'
        read_only_fields = ['user', 'size', 'uploaded_at', 'last_downloaded']

class UserListSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "email", "username", "fullname", "is_admin"]
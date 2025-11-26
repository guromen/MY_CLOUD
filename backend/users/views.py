from django.shortcuts import render
from rest_framework import permissions, viewsets
from .models import *
from .serializers import *
from rest_framework.response import Response
from django.contrib.auth import get_user_model, authenticate
from knox.models import AuthToken
from rest_framework.decorators import action
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.parsers import JSONParser
from django.utils import timezone
from rest_framework.decorators import action
from django.http import FileResponse
import mimetypes
from rest_framework import generics

User = get_user_model()

class LoginViewset(viewsets.ViewSet):
    permission_classes = [permissions.AllowAny]
    serializer_class = LoginSerializer

    def create(self, request): 
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid(): 
            email = serializer.validated_data['email']
            password = serializer.validated_data['password']
            user = authenticate(request, email=email, password=password) #ф-ция EmailAuthBackend()
            if user: 
                _, token = AuthToken.objects.create(user)
                return Response(
                    {
                        "user": self.serializer_class(user).data,
                        "token": token
                    }
                )
            else: 
                return Response({"error":"Недопустимые данные"}, status=401)    
        else: 
            return Response(serializer.errors,status=400)

class RegisterViewset(viewsets.ViewSet):
    permission_classes = [permissions.AllowAny]
    queryset = User.objects.all()
    serializer_class = RegisterSerializer

    def create(self,request):
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        else: 
            return Response(serializer.errors,status=400)

#представление файла
class UserFileViewSet(viewsets.ModelViewSet):
    serializer_class = UserFileSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_queryset(self):
        user = self.request.user
        user_id = self.request.query_params.get("user_id")

        if user.is_staff or getattr(user, "is_admin", False):
            # если админ и указан user_id, показываем файлы этого пользователя
            if user_id:
                return UserFile.objects.filter(user_id=user_id)
            return UserFile.objects.all()
        else:
            # для обычного пользователя — только свои файлы
            return UserFile.objects.filter(user=user)

    def perform_create(self, serializer):
        user = self.request.user
        target_user_id = self.request.data.get("user_id")

        # если админ — может загружать файлы в чужие папки
        if user.is_staff or getattr(user, "is_admin", False):
            if target_user_id:
                target_user = User.objects.get(id=target_user_id)
                return serializer.save(user=target_user)
        # обычный пользователь
        serializer.save(user=user)

   #скачивание файла
    @action(detail=True, methods=['get']) 
    def download(self, request, pk=None):
        file_obj = self.get_object()
        file_obj.last_downloaded = timezone.now()
        file_obj.save()
        return FileResponse(file_obj.file.open(), as_attachment=True)
    
#просмотр файла
def file_preview(request, pk):
    file_obj = UserFile.objects.get(pk=pk)


    file_obj.last_downloaded = timezone.now()
    file_obj.save(update_fields=["last_downloaded"])


    mime_type, _ = mimetypes.guess_type(file_obj.file.path)
    if not mime_type:
        mime_type = "application/octet-stream"

    response = FileResponse(open(file_obj.file.path, "rb"), content_type=mime_type)
    response["Content-Disposition"] = f'inline; filename="{file_obj.name}"'
    return response

#общий просмотр файла и ссылка на файл
class FileView(generics.GenericAPIView):
    queryset = UserFile.objects.all()

    def get(self, request, pk, *args, **kwargs):
        file_obj = self.get_object()
        file = open(file_obj.file.path, 'rb')
        return FileResponse(file)
        
class UserViewset(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated]
    queryset = User.objects.all()
    def get_serializer_class(self):
        if self.action in ["list", "retrieve", "me"]:
            return UserListSerializer 
        return RegisterSerializer      

    #Только админ видит всех пользователей
    def get_queryset(self):
        user = self.request.user
        if user.is_staff or getattr(user, 'is_admin', False): 
            return User.objects.all()
        return User.objects.filter(id=user.id)

    # /users/me/
    @action(detail=False, methods=['get'])
    def me(self, request):
        serializer = UserListSerializer(request.user)
        return Response(serializer.data)

    # Админ может менять признак администратора
    def partial_update(self, request, pk=None):
        user = self.get_object()
        if not request.user.is_staff and not getattr(request.user, 'is_admin', False):
            return Response({"message": "Нет прав для изменения."}, status=status.HTTP_403_FORBIDDEN)

        serializer = RegisterSerializer(user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        # print(serializer.data)
        return Response(serializer.data)

    #Админ может удалять пользователей
    def destroy(self, request, *args, **kwargs):
        if not request.user.is_staff and not getattr(request.user, 'is_admin', False):
            return Response({"detail": "Нет прав для удаления."}, status=status.HTTP_403_FORBIDDEN)
        return super().destroy(request, *args, **kwargs)

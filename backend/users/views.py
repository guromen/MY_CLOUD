from django.shortcuts import render
from rest_framework import permissions, viewsets, status
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
import logging
from rest_framework.throttling import UserRateThrottle
from knox.views import LogoutAllView as KnoxLogoutView
from django.views.decorators.csrf import ensure_csrf_cookie
from django.http import JsonResponse
from rest_framework.decorators import api_view


User = get_user_model()
logger = logging.getLogger(__name__)

class FileUploadThrottle(UserRateThrottle):
    rate = "1000/minute"

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
                logger.info(f"[LOGIN] Пользователь {email} успешно вошёл")
                response = Response({
                    "user": self.serializer_class(user).data
                }, status=status.HTTP_200_OK)

                response.set_cookie(
                    key='auth_token',
                    value=token,
                    httponly=True,
                    secure=False,      # True на https/проде
                    samesite='Lax',    
                    max_age=60 * 60 * 24 * 7  # 7 дней
                )

                return response
            else: 
                logger.info(f"[LOGIN FAILED] Попытка входа с {email}")
                return Response({"error":"Недопустимые данные"}, status=401)    
        else: 
            return Response(serializer.errors,status=400)

class LogoutView(KnoxLogoutView):
    def post(self, request, format=None):
        response = super().post(request, format=None)
        # удаляем cookie
        response.delete_cookie('auth_token')
        return response

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
    throttle_classes = [FileUploadThrottle]

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
                logger.info(f"[UPLOAD] Админ {user.email} загрузил файл для {target_user.email}")
                return serializer.save(user=target_user)
        # обычный пользователь
        serializer.save(user=user)
        logger.info(f"[UPLOAD] Пользователь {user.email} загрузил файл")

   #скачивание файла
    @action(detail=True, methods=['get']) 
    def download(self, request, pk=None):
        file_obj = self.get_object()
        file_obj.last_downloaded = timezone.now()
        file_obj.save()
        logger.info(f"[DOWNLOAD] Пользователь {request.user.email} скачал файл: {file_obj.name}")
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
    throttle_classes = [FileUploadThrottle]
    queryset = UserFile.objects.all()
    def get(self, request, uid, *args, **kwargs):
        file_obj = self.queryset.get(public_uid=uid)
        logger.info(f"[PUBLIC LINK] Доступ к файлу {file_obj.name} через uid {uid}")
        file = open(file_obj.file.path, 'rb')
        return FileResponse(file)
        
class UserViewset(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    throttle_classes = [FileUploadThrottle]
    queryset = User.objects.all()
    def get_serializer_class(self):
        if self.action in ["list", "retrieve", "me"]:
            return UserListSerializer  #сериализатор для GET
        if self.action in ["update", "partial_update"]:
            return  UserUpdateSerializer
        return RegisterSerializer      #сериализатор для create/update

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

        serializer = self.get_serializer(user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        logger.info(f"[USER UPDATED] Пользователь {user.email} обновлён админом {request.user.email}")
        print(serializer.data)
        return Response(serializer.data, status=200)

    #Админ может удалять пользователей
    def destroy(self, request, *args, **kwargs):
        user = self.get_object()
        if not request.user.is_staff and not getattr(request.user, 'is_admin', False):
            return Response({"detail": "Нет прав для удаления."}, status=status.HTTP_403_FORBIDDEN)
        logger.info(f"[USER DELETED] Пользователь {user.email} удалён админом")
        return super().destroy(request, *args, **kwargs)
    
@ensure_csrf_cookie
def get_csrf(request):
    return JsonResponse({'detail': 'CSRF cookie set'})
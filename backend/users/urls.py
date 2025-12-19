from django.contrib import admin
from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import RegisterViewset, LoginViewset, UserViewset, UserFileViewSet, file_preview, FileView

router = DefaultRouter()
router.register('register', RegisterViewset, basename='register'),
router.register('login', LoginViewset, basename='login'),
router.register('users', UserViewset, basename='users'),
router.register('files', UserFileViewSet, basename='files')

urlpatterns = [
    path('files/<int:pk>/preview/', file_preview, name='file-preview'),
    path('api/share/<uuid:uid>/', FileView.as_view(), name='open_share_file'),

]

urlpatterns += router.urls
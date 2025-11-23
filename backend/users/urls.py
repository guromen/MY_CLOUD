from django.contrib import admin
from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import RegisterViewset, LoginViewset, UserViewset, UserFileViewSet

router = DefaultRouter()
router.register('register', RegisterViewset, basename='register'),
router.register('login', LoginViewset, basename='login'),
router.register('users', UserViewset, basename='users'),
router.register('files', UserFileViewSet, basename='files')

urlpatterns = router.urls

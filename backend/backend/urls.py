from django.contrib import admin
from django.urls import path, include
from knox import views as knox_views
from django.conf import settings 
from django.conf.urls.static import static 
from users.views import LogoutView
from users.views import get_csrf

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include('users.urls')),
    path('logout/', LogoutView.as_view(), name='knox_logout'),
    path('csrf/', get_csrf),
]
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
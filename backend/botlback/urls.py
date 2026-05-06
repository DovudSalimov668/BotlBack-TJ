from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('apps.users.urls')),
    path('api/bottles/', include('apps.bottles.urls')),
    path('api/recycling/', include('apps.recycling.urls')),
    path('api/rewards/', include('apps.rewards.urls')),
    path('api/users/', include('apps.users.user_urls')),
    path('api/analytics/', include('apps.analytics.urls')),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

# monitoring_komputer/urls.py
from django.contrib import admin
from django.urls import path, include
from rest_framework.authtoken.views import obtain_auth_token

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('inventory.urls')),
    path('api/token/', obtain_auth_token),
    # Anda bisa menambahkan URL untuk komputer_ping di sini jika ada API publik di sana
    # path('api/ping/', include('komputer_ping.urls')),
]
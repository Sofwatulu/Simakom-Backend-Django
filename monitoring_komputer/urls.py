# monitoring_komputer/urls.py
from django.contrib import admin
from django.urls import path, include
from inventory import urls as inventory_urls

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(inventory_urls)),
]

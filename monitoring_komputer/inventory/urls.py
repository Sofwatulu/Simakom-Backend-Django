# D:\simakom\monitoring_komputer\inventory\urls.py

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    KomputerViewSet, RiwayatKerusakanViewSet, RiwayatPerawatanViewSet,
    KomponenViewSet, UserViewSet,
    # monitoring_komputer_view, 
    monitoring_komputer_admin_view 
)

router = DefaultRouter()
router.register(r'komputer', KomputerViewSet)
router.register(r'riwayatkerusakan', RiwayatKerusakanViewSet)
router.register(r'riwayatperawatan', RiwayatPerawatanViewSet)
router.register(r'komponen', KomponenViewSet)
router.register(r'users', UserViewSet)

urlpatterns = [
    path('', include(router.urls)),
    # path('monitoring-komputer/', monitoring_komputer_view, name='monitoring_komputer'), # <--- Hapus atau Komentari Baris Ini
]
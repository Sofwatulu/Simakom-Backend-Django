# inventory/views.py
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from django.contrib.auth.models import User
from .serializers import (
    KomputerSerializer,
    RiwayatKerusakanSerializer,
    RiwayatPerawatanSerializer,
    KomponenSerializer,
    UserSerializer # Tambahkan UserSerializer
)
from .models import Komputer, RiwayatKerusakan, RiwayatPerawatan, Komponen
from inventory.permissions import IsTeknisi 
import requests
from django.shortcuts import render
from django.contrib.admin.views.decorators import staff_member_required # <-- Tambahkan import ini

class KomputerViewSet(viewsets.ModelViewSet):
    queryset = Komputer.objects.all()
    serializer_class = KomputerSerializer
    permission_classes = [IsAuthenticated]

class RiwayatKerusakanViewSet(viewsets.ModelViewSet):
    queryset = RiwayatKerusakan.objects.all()
    serializer_class = RiwayatKerusakanSerializer
    permission_classes = [IsTeknisi]

class RiwayatPerawatanViewSet(viewsets.ModelViewSet):
    queryset = RiwayatPerawatan.objects.all()
    serializer_class = RiwayatPerawatanSerializer
    permission_classes = [IsTeknisi]

class KomponenViewSet(viewsets.ModelViewSet):
    queryset = Komponen.objects.all()
    serializer_class = KomponenSerializer
    permission_classes = [IsTeknisi]

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all().order_by('username')
    serializer_class = UserSerializer
    permission_classes = [IsAdminUser]

@staff_member_required # <-- Decorator ini memastikan hanya user staf/admin yang bisa mengakses view ini
def monitoring_komputer_admin_view(request): # <-- Nama fungsi diubah
    node_api_url = "http://localhost:3000/komputer/status"
    data_komputer_dari_node = []
    pesan_error = None

    try:
        response = requests.get(node_api_url, timeout=5)
        response.raise_for_status() # Akan melempar HTTPError jika status code adalah 4xx atau 5xx
        data_api = response.json()

        if data_api.get('success'):
            data_komputer_dari_node = data_api.get('data', [])
        else:
            pesan_error = data_api.get('message', 'Terjadi kesalahan pada API Node.js.')

    except requests.exceptions.ConnectionError:
        pesan_error = "Sistem pemantauan (Node.js) tidak berjalan atau tidak dapat dijangkau. Pastikan `npm run dev` aktif."
    except requests.exceptions.Timeout:
        pesan_error = "Waktu koneksi ke sistem pemantauan (Node.js) habis."
    except requests.exceptions.RequestException as e:
        pesan_error = f"Terjadi kesalahan saat memanggil API Node.js: {e}"
    except ValueError:
        pesan_error = "Gagal mem-parsing respons JSON dari sistem pemantauan. Respons tidak valid."

    # Menyiapkan data untuk dikirim ke template HTML
    context = {
        'daftar_komputer_online': data_komputer_dari_node,
        'pesan_kesalahan_pemantauan': pesan_error,
        # Tambahkan ini agar template admin dapat di-extend dengan benar
        'site_header': 'Admin Monitoring', # Header situs admin
        'site_title': 'Monitoring Komputer Admin', # Judul tab browser
        'title': 'Status Pemantauan Komputer', # Judul halaman di dalam admin
        'has_permission': True, # Asumsi user punya permission karena @staff_member_required
    }
    # Merender template HTML yang baru khusus untuk admin
    return render(request, 'admin/monitoring_komputer_admin.html', context) # <-- Ubah path template
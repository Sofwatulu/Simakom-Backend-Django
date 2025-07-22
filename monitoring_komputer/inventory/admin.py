# D:\simakom\monitoring_komputer\inventory\admin.py

from django.contrib import admin
from django.urls import path # Pastikan ini diimpor
from .models import Komputer, RiwayatKerusakan, RiwayatPerawatan, Komponen, PerawatanKomponen
from .views import monitoring_komputer_admin_view # Pastikan ini diimpor


@admin.register(Komputer)
class KomputerAdmin(admin.ModelAdmin):
    list_display = (
        'dal_code', 'machine_name', 'location', 'machine_condition'
    )
    list_filter = ('location', 'machine_condition', 'acquisition_year', 'group_name')
    search_fields = ('dal_code', 'machine_name', 'location', 'operator_name')


class PerawatanKomponenInline(admin.TabularInline):
    model = PerawatanKomponen
    extra = 1


@admin.register(RiwayatPerawatan)
class RiwayatPerawatanAdmin(admin.ModelAdmin):
    list_display = ('komputer', 'tanggal', 'deskripsi')
    list_filter = ('tanggal', 'komputer')
    search_fields = ('deskripsi', 'komputer__machine_name')
    inlines = [PerawatanKomponenInline]


@admin.register(RiwayatKerusakan)
class RiwayatKerusakanAdmin(admin.ModelAdmin):
    list_display = ('komputer', 'tanggal', 'deskripsi')
    list_filter = ('tanggal',)
    search_fields = ('deskripsi', 'komputer__machine_name')


@admin.register(Komponen)
class KomponenAdmin(admin.ModelAdmin):
    list_display = ('material_name', 'material_id', 'stock', 'broken_stock')
    list_filter = ('types', 'cat_name',)
    search_fields = ('material_name', 'material_id',)


@admin.register(PerawatanKomponen)
class PerawatanKomponenAdmin(admin.ModelAdmin):
    list_display = ('riwayat_perawatan', 'komponen', 'jumlah_digunakan')
    list_filter = ('komponen',)
    search_fields = ('riwayat_perawatan__deskripsi', 'komponen__material_name')


# Simpan referensi ke method get_urls asli
original_get_urls = admin.site.get_urls

# Definisikan method get_urls yang baru
def get_custom_admin_urls():
    # Panggil method get_urls asli untuk mendapatkan URL bawaan Admin
    urls = original_get_urls()
    
    # Tambahkan URL kustom Anda
    custom_urls = [
        path('pemantauan-komputer/', admin.site.admin_view(monitoring_komputer_admin_view), name='pemantauan_komputer'),
    ]
    
    # Gabungkan URL kustom dengan URL bawaan Admin
    return custom_urls + urls

# Timpa method get_urls di admin.site dengan method baru kita
admin.site.get_urls = get_custom_admin_urls
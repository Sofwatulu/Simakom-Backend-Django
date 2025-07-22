# inventory/signals.py
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from .models import PerawatanKomponen, Komponen

@receiver(post_save, sender=PerawatanKomponen)
def decrease_komponen_stock(sender, instance, created, **kwargs):
    if created:
        komponen = instance.komponen
        komponen.stock -= instance.jumlah_digunakan
        komponen.save()
        print(f"Stok {komponen.material_name} dikurangi {instance.jumlah_digunakan}. Stok baru: {komponen.stock}")

@receiver(post_delete, sender=PerawatanKomponen)
def increase_komponen_stock_on_delete(sender, instance, **kwargs):
    komponen = instance.komponen
    komponen.stock += instance.jumlah_digunakan
    komponen.save()
    print(f"Stok {komponen.material_name} dikembalikan {instance.jumlah_digunakan}. Stok baru: {komponen.stock}")
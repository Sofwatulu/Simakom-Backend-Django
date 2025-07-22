# inventory/models.py
from django.db import models
from django.utils import timezone

class Komputer(models.Model):
    sap_code = models.CharField(max_length=100, null=True, blank=True)
    dal_code = models.CharField(max_length=100, unique=True)
    inventory_code = models.CharField(max_length=100, null=True, blank=True)
    machine_name = models.CharField(max_length=255)
    acquisition_year = models.IntegerField()
    location = models.CharField(max_length=255)
    cost_center = models.CharField(max_length=100, null=True, blank=True)
    operator_name = models.CharField(max_length=100)
    MACHINE_CONDITION_CHOICES = [
        ('A', 'Baik Sekali'), ('B', 'Baik'), ('C', 'Kurang Baik'), ('D', 'Rusak'),
    ]
    machine_condition = models.CharField(max_length=50, choices=MACHINE_CONDITION_CHOICES, default='B')
    group_id = models.IntegerField()
    group_name = models.CharField(max_length=100)

    class Meta:
        verbose_name = "Komputer"
        verbose_name_plural = "Komputer"

    def __str__(self):
        return f"{self.machine_name} ({self.dal_code})"

class Komponen(models.Model):
    matgroup_id = models.IntegerField() # Pastikan default diberikan jika data sudah ada
    material_id = models.CharField(max_length=100, unique=True)
    material_name = models.CharField(max_length=255)
    price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    price_reference = models.CharField(max_length=255, null=True, blank=True) # Pastikan null=True, blank=True
    safety_stock = models.IntegerField(default=0)
    unit = models.CharField(max_length=50, null=True, blank=True) # Pastikan null=True, blank=True
    type_id = models.IntegerField(null=True, blank=True)
    is_disposable = models.BooleanField(default=False)
    label = models.CharField(max_length=100, null=True, blank=True)
    cat_id = models.IntegerField(null=True, blank=True)
    group_id = models.IntegerField(null=True, blank=True)
    stock = models.IntegerField(default=0)
    broken_stock = models.IntegerField(default=0)
    types = models.CharField(max_length=100, null=True, blank=True)
    cat_name = models.CharField(max_length=100, null=True, blank=True)

    class Meta:
        verbose_name = "Komponen"
        verbose_name_plural = "Komponen"

    def __str__(self):
        return self.material_name

class RiwayatPerawatan(models.Model):
    komputer = models.ForeignKey(Komputer, on_delete=models.CASCADE, related_name='riwayat_perawatan')
    tanggal = models.DateField()
    deskripsi = models.TextField()

    class Meta:
        verbose_name = "Riwayat Perawatan"
        verbose_name_plural = "Riwayat Perawatan"

    def __str__(self):
        return f"Perawatan {self.komputer.machine_name} - {self.tanggal}"

class RiwayatKerusakan(models.Model):
    komputer = models.ForeignKey(Komputer, on_delete=models.CASCADE, related_name='riwayat_kerusakan')
    tanggal = models.DateField()
    deskripsi = models.TextField()

    class Meta:
        verbose_name = "Riwayat Kerusakan"
        verbose_name_plural = "Riwayat Kerusakan"

    def __str__(self):
        return f"Kerusakan {self.komputer.machine_name} - {self.tanggal}"

class PerawatanKomponen(models.Model):
    riwayat_perawatan = models.ForeignKey(RiwayatPerawatan, on_delete=models.CASCADE)
    komponen = models.ForeignKey(Komponen, on_delete=models.CASCADE)
    jumlah_digunakan = models.IntegerField(default=1)

    class Meta:
        verbose_name = "Komponen Digunakan"
        verbose_name_plural = "Komponen Digunakan"
        unique_together = ('riwayat_perawatan', 'komponen')

    def __str__(self):
        return f"{self.jumlah_digunakan}x {self.komponen.material_name} for Perawatan {self.riwayat_perawatan.komputer.machine_name} on {self.riwayat_perawatan.tanggal}"
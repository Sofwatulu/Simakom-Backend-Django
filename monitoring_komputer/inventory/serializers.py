# inventory/serializers.py
from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Komputer, RiwayatKerusakan, RiwayatPerawatan, Komponen, PerawatanKomponen
# from komputer_ping.models import MonitoringStatus # Baris ini dihapus/dikomentari


class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'is_staff', 'is_active', 'date_joined', 'password']
        read_only_fields = ['id', 'date_joined']

    def create(self, validated_data):
        password = validated_data.pop('password', None)
        user = User.objects.create(**validated_data)
        if password is not None:
            user.set_password(password)
            user.save()
        return user

    def update(self, instance, validated_data):
        for attr, value in validated_data.items():
            if attr == 'password':
                instance.set_password(value)
            else:
                setattr(instance, attr, value)
        instance.save()
        return instance

class KomputerSerializer(serializers.ModelSerializer):
    # monitoring_status = MonitoringStatusSerializer(read_only=True) # Baris ini dihapus/dikomentari

    class Meta:
        model = Komputer
        fields = '__all__'

class RiwayatKerusakanSerializer(serializers.ModelSerializer):
    class Meta:
        model = RiwayatKerusakan
        fields = '__all__'

class RiwayatPerawatanSerializer(serializers.ModelSerializer):
    komponen_digunakan = serializers.SerializerMethodField() # Gunakan SerializerMethodField untuk admin display

    class Meta:
        model = RiwayatPerawatan
        fields = '__all__'

    def get_komponen_digunakan(self, obj):
        return PerawatanKomponenSerializer(obj.perawatankomponen_set.all(), many=True).data

class KomponenSerializer(serializers.ModelSerializer):
    class Meta:
        model = Komponen
        fields = '__all__'

class PerawatanKomponenSerializer(serializers.ModelSerializer):
    class Meta:
        model = PerawatanKomponen
        fields = ['komponen', 'jumlah_digunakan']
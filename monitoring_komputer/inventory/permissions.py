# inventory/permissions.py
from rest_framework import permissions

class IsTeknisi(permissions.BasePermission):
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        return request.user.groups.filter(name='Teknisi').exists()
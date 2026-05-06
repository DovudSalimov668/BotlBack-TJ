from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User

@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ('phone', 'name', 'region', 'is_staff', 'total_points', 'bottles_recycled', 'created_at')
    list_filter = ('is_staff', 'region', 'language')
    search_fields = ('phone', 'name')
    ordering = ('-created_at',)
    fieldsets = (
        (None, {'fields': ('phone', 'password')}),
        ('Личные данные', {'fields': ('name', 'language', 'region', 'role')}),
        ('Права', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
    )
    add_fieldsets = (
        (None, {'classes': ('wide',), 'fields': ('phone', 'name', 'password1', 'password2')}),
    )
    readonly_fields = ('created_at',)

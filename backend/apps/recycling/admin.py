from django.contrib import admin
from .models import RecyclingPoint

@admin.register(RecyclingPoint)
class RecyclingPointAdmin(admin.ModelAdmin):
    list_display = ('name', 'region', 'qr_code', 'is_active', 'latitude', 'longitude')
    list_filter = ('region', 'is_active')
    search_fields = ('name', 'qr_code')

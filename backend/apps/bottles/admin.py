from django.contrib import admin
from .models import SKU, Bottle

@admin.register(SKU)
class SKUAdmin(admin.ModelAdmin):
    list_display = ('name', 'brand', 'volume_ml', 'package_type')
    list_filter = ('brand', 'package_type')

@admin.register(Bottle)
class BottleAdmin(admin.ModelAdmin):
    list_display = ('qr_code', 'sku', 'batch_number', 'is_scanned', 'is_recycled', 'created_at')
    list_filter = ('is_scanned', 'is_recycled', 'sku__brand')
    search_fields = ('qr_code', 'batch_number')
    readonly_fields = ('created_at',)

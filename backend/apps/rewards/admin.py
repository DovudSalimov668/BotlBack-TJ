from django.contrib import admin
from .models import Prize, Redemption

@admin.register(Prize)
class PrizeAdmin(admin.ModelAdmin):
    list_display = ('name', 'points_cost', 'stock_quantity', 'is_active')
    list_filter = ('is_active',)

@admin.register(Redemption)
class RedemptionAdmin(admin.ModelAdmin):
    list_display = ('user', 'prize', 'points_spent', 'status', 'redeemed_at')
    list_filter = ('status',)
    readonly_fields = ('redeemed_at',)

from django.contrib import admin
from .models import DailyMetrics, Campaign

@admin.register(DailyMetrics)
class DailyMetricsAdmin(admin.ModelAdmin):
    list_display = ('date', 'region', 'bottles_purchased', 'bottles_recycled', 'recycling_rate')
    list_filter = ('region',)
    date_hierarchy = 'date'

@admin.register(Campaign)
class CampaignAdmin(admin.ModelAdmin):
    list_display = ('name', 'start_date', 'end_date', 'target_bottles', 'is_active')
    list_filter = ('is_active',)

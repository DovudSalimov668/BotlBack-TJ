from django.db import models


class DailyMetrics(models.Model):
    REGION_CHOICES = [
        ('dushanbe', 'Душанбе'),
        ('sughd', 'Согд'),
        ('khatlon', 'Хатлон'),
        ('gbao', 'ГБАО'),
        ('rrs', 'РРС'),
        ('all', 'Все'),
    ]

    date = models.DateField(db_index=True)
    region = models.CharField(max_length=20, choices=REGION_CHOICES, default='all')
    bottles_purchased = models.PositiveIntegerField(default=0)
    bottles_recycled = models.PositiveIntegerField(default=0)
    unique_users = models.PositiveIntegerField(default=0)
    recycling_rate = models.FloatField(default=0.0)

    class Meta:
        verbose_name = 'Дневные метрики'
        verbose_name_plural = 'Дневные метрики'
        unique_together = ('date', 'region')
        ordering = ['-date']

    def __str__(self):
        return f"{self.date} / {self.region}"


class Campaign(models.Model):
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    start_date = models.DateField()
    end_date = models.DateField()
    target_bottles = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Кампания'
        verbose_name_plural = 'Кампании'
        ordering = ['-start_date']

    def __str__(self):
        return self.name

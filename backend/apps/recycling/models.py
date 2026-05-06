from django.db import models


class RecyclingPoint(models.Model):
    REGION_CHOICES = [
        ('dushanbe', 'Душанбе'),
        ('sughd', 'Согд'),
        ('khatlon', 'Хатлон'),
        ('gbao', 'ГБАО'),
        ('rrs', 'РРС'),
    ]

    name = models.CharField(max_length=200)
    name_tg = models.CharField(max_length=200, blank=True)
    address = models.TextField(blank=True)
    latitude = models.FloatField()
    longitude = models.FloatField()
    region = models.CharField(max_length=20, choices=REGION_CHOICES, default='dushanbe')
    qr_code = models.CharField(max_length=30, unique=True, db_index=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Точка сбора'
        verbose_name_plural = 'Точки сбора'

    def __str__(self):
        return self.name

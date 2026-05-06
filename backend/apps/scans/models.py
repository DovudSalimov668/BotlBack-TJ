from django.db import models
from django.conf import settings


class Scan(models.Model):
    SCAN_TYPE_CHOICES = [('purchase', 'Purchase'), ('recycle', 'Recycle')]
    REGION_CHOICES = [
        ('dushanbe', 'Душанбе'),
        ('sughd', 'Согд'),
        ('khatlon', 'Хатлон'),
        ('gbao', 'ГБАО'),
        ('rrs', 'РРС'),
    ]

    bottle = models.ForeignKey('bottles.Bottle', on_delete=models.CASCADE, related_name='scans')
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='scans',
    )
    scan_type = models.CharField(max_length=10, choices=SCAN_TYPE_CHOICES)
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)
    region = models.CharField(max_length=20, choices=REGION_CHOICES, default='dushanbe')
    points_awarded = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(db_index=True)

    class Meta:
        verbose_name = 'Скан'
        verbose_name_plural = 'Сканы'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.scan_type} - {self.bottle.qr_code} by {self.user}"

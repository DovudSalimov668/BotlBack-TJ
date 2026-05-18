from django.db import models
from django.conf import settings


class Scan(models.Model):
    SCAN_TYPE_CHOICES = [
        ('purchase', 'Purchase'),
        ('recycle', 'Recycle'),
        ('referral_bonus', 'Referral Bonus'),
        ('admin_adjustment', 'Admin Adjustment'),
    ]
    REGION_CHOICES = [
        ('dushanbe', 'Душанбе'),
        ('sughd', 'Согд'),
        ('khatlon', 'Хатлон'),
        ('gbao', 'ГБАО'),
        ('rrs', 'РРС'),
    ]

    bottle = models.ForeignKey(
        'bottles.Bottle', on_delete=models.CASCADE, related_name='scans',
        null=True, blank=True,
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='scans',
    )
    scan_type = models.CharField(max_length=16, choices=SCAN_TYPE_CHOICES)
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)
    region = models.CharField(max_length=20, choices=REGION_CHOICES, default='dushanbe', db_index=True)
    points_awarded = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(db_index=True)

    class Meta:
        verbose_name = 'Скан'
        verbose_name_plural = 'Сканы'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['scan_type', 'created_at']),
            models.Index(fields=['user', 'scan_type']),
        ]

    def __str__(self):
        qr = self.bottle.qr_code if self.bottle else 'bonus'
        return f"{self.scan_type} - {qr} by {self.user}"

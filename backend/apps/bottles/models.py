from django.db import models


class SKU(models.Model):
    BRAND_CHOICES = [
        ('coca-cola', 'Coca-Cola'),
        ('coke-zero', 'Coke Zero'),
        ('fanta', 'Fanta'),
        ('sprite', 'Sprite'),
        ('schweppes', 'Schweppes'),
        ('fuse-tea', 'Fuse Tea'),
        ('piko', 'Piko'),
        ('bonaqua', 'Bonaqua'),
    ]
    PACKAGE_CHOICES = [('PET', 'PET'), ('glass', 'Glass'), ('can', 'Can')]

    name = models.CharField(max_length=100)
    brand = models.CharField(max_length=20, choices=BRAND_CHOICES)
    volume_ml = models.PositiveIntegerField()
    package_type = models.CharField(max_length=10, choices=PACKAGE_CHOICES, default='PET')
    image_url = models.URLField(blank=True)

    class Meta:
        verbose_name = 'SKU'
        verbose_name_plural = 'SKUs'

    def __str__(self):
        return self.name


class Bottle(models.Model):
    qr_code = models.CharField(max_length=20, unique=True, db_index=True)
    sku = models.ForeignKey(SKU, on_delete=models.PROTECT, related_name='bottles')
    batch_number = models.CharField(max_length=50, blank=True)
    produced_at = models.DateField(null=True, blank=True)
    is_scanned = models.BooleanField(default=False)
    is_recycled = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Бутылка'
        verbose_name_plural = 'Бутылки'

    def __str__(self):
        return f"{self.qr_code} ({self.sku.name})"

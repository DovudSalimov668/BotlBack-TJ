from django.db import models
from django.conf import settings


class Prize(models.Model):
    name = models.CharField(max_length=200)
    name_tg = models.CharField(max_length=200, blank=True)
    points_cost = models.PositiveIntegerField()
    image_url = models.URLField(blank=True)
    stock_quantity = models.IntegerField(default=-1)
    is_active = models.BooleanField(default=True)

    class Meta:
        verbose_name = 'Приз'
        verbose_name_plural = 'Призы'
        ordering = ['points_cost']

    def __str__(self):
        return f"{self.name} ({self.points_cost} pts)"


class Redemption(models.Model):
    STATUS_CHOICES = [('pending', 'Pending'), ('fulfilled', 'Fulfilled'), ('cancelled', 'Cancelled')]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='redemptions',
    )
    prize = models.ForeignKey(Prize, on_delete=models.PROTECT, related_name='redemptions')
    points_spent = models.PositiveIntegerField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    redeemed_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Погашение'
        verbose_name_plural = 'Погашения'
        ordering = ['-redeemed_at']

    def __str__(self):
        return f"{self.user} → {self.prize.name}"

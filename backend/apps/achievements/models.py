from django.db import models
from django.conf import settings


class Achievement(models.Model):
    """Catalog of all possible achievements (static)."""
    code = models.CharField(max_length=40, unique=True)
    name = models.CharField(max_length=80)
    description = models.CharField(max_length=200)
    emoji = models.CharField(max_length=8, default='🏆')
    threshold = models.PositiveIntegerField(default=0)  # e.g. bottles count, streak days
    kind = models.CharField(max_length=20, default='count')  # count | streak | special

    def __str__(self):
        return f"{self.emoji} {self.name}"


class UserAchievement(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='achievements')
    achievement = models.ForeignKey(Achievement, on_delete=models.CASCADE)
    unlocked_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'achievement')
        ordering = ['-unlocked_at']

from rest_framework import serializers
from .models import Achievement, UserAchievement


class AchievementSerializer(serializers.ModelSerializer):
    class Meta:
        model = Achievement
        fields = ['code', 'name', 'description', 'emoji', 'threshold', 'kind']


class UserAchievementSerializer(serializers.ModelSerializer):
    achievement = AchievementSerializer(read_only=True)
    unlocked = serializers.BooleanField(default=True)

    class Meta:
        model = UserAchievement
        fields = ['achievement', 'unlocked_at', 'unlocked']

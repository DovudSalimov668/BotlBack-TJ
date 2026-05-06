from rest_framework import serializers
from .models import User


class UserSerializer(serializers.ModelSerializer):
    total_points = serializers.ReadOnlyField()
    bottles_recycled = serializers.ReadOnlyField()
    co2_saved_kg = serializers.ReadOnlyField()

    class Meta:
        model = User
        fields = [
            'id', 'phone', 'name', 'language', 'region', 'is_staff',
            'total_points', 'bottles_recycled', 'co2_saved_kg', 'created_at',
        ]
        read_only_fields = ['id', 'phone', 'is_staff', 'created_at']

from rest_framework.views import APIView
from rest_framework.generics import ListAPIView, RetrieveAPIView
from rest_framework.permissions import AllowAny
from rest_framework import serializers
from .models import RecyclingPoint


class RecyclingPointSerializer(serializers.ModelSerializer):
    class Meta:
        model = RecyclingPoint
        fields = '__all__'


class RecyclingPointListView(ListAPIView):
    permission_classes = [AllowAny]
    serializer_class = RecyclingPointSerializer
    queryset = RecyclingPoint.objects.filter(is_active=True)


class RecyclingPointDetailView(RetrieveAPIView):
    permission_classes = [AllowAny]
    serializer_class = RecyclingPointSerializer
    queryset = RecyclingPoint.objects.all()

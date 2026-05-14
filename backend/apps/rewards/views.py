from django.db import transaction
from django.db.models import Sum
from rest_framework import serializers
from rest_framework.generics import ListAPIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Prize, Redemption


class PrizeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Prize
        fields = '__all__'


class RedemptionSerializer(serializers.ModelSerializer):
    prize_name = serializers.CharField(source='prize.name', read_only=True)

    class Meta:
        model = Redemption
        fields = ['id', 'prize', 'prize_name', 'points_spent', 'status', 'redeemed_at']


class PrizeListView(ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = PrizeSerializer
    queryset = Prize.objects.filter(is_active=True)


class RedeemView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        prize_id = request.data.get('prize_id')
        with transaction.atomic():
            prize = Prize.objects.select_for_update().filter(id=prize_id, is_active=True).first()
            if not prize:
                return Response({'error': 'Prize not found'}, status=404)
            if prize.stock_quantity == 0:
                return Response({'error': 'Out of stock'}, status=400)
            earned = request.user.scans.aggregate(total=Sum('points_awarded'))['total'] or 0
            spent = request.user.redemptions.aggregate(total=Sum('points_spent'))['total'] or 0
            current_points = max(0, earned - spent)
            if current_points < prize.points_cost:
                return Response({'error': 'Insufficient points'}, status=400)
            redemption = Redemption.objects.create(
                user=request.user,
                prize=prize,
                points_spent=prize.points_cost,
                status='pending',
            )
            if prize.stock_quantity > 0:
                prize.stock_quantity -= 1
                prize.save(update_fields=['stock_quantity'])
        return Response({
            'redemption_id': redemption.id,
            'prize': prize.name,
            'points_spent': redemption.points_spent,
            'remaining_points': request.user.total_points,
        }, status=201)


class RedemptionHistoryView(ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = RedemptionSerializer

    def get_queryset(self):
        return Redemption.objects.filter(user=self.request.user).select_related('prize')

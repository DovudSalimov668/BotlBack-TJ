from django.contrib.auth import get_user_model
from django.db import transaction
from django.db.models import Sum
from rest_framework import serializers
from rest_framework.generics import ListAPIView
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Prize, Redemption

User = get_user_model()


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
            # Lock user row first (prevents double-spend under concurrent requests)
            user = User.objects.select_for_update().get(pk=request.user.pk)
            prize = Prize.objects.select_for_update().filter(id=prize_id, is_active=True).first()
            if not prize:
                return Response({'error': 'Prize not found'}, status=404)
            if prize.stock_quantity == 0:
                return Response({'error': 'Out of stock'}, status=400)
            earned = user.scans.aggregate(total=Sum('points_awarded'))['total'] or 0
            spent = user.redemptions.aggregate(total=Sum('points_spent'))['total'] or 0
            current_points = max(0, earned - spent)
            if current_points < prize.points_cost:
                return Response({'error': 'Insufficient points'}, status=400)
            redemption = Redemption.objects.create(
                user=user,
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
            'remaining_points': user.total_points,
        }, status=201)


class RedemptionHistoryView(ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = RedemptionSerializer

    def get_queryset(self):
        return Redemption.objects.filter(user=self.request.user).select_related('prize')


# ── Admin management ──────────────────────────────────────────────────────────

class AdminPrizeListCreateView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        prizes = Prize.objects.all().order_by('-is_active', 'points_cost')
        return Response(PrizeSerializer(prizes, many=True).data)

    def post(self, request):
        s = PrizeSerializer(data=request.data)
        if s.is_valid():
            s.save()
            return Response(s.data, status=201)
        return Response(s.errors, status=400)


class AdminPrizeDetailView(APIView):
    permission_classes = [IsAdminUser]

    def patch(self, request, pk):
        prize = Prize.objects.filter(pk=pk).first()
        if not prize:
            return Response({'error': 'Not found'}, status=404)
        s = PrizeSerializer(prize, data=request.data, partial=True)
        if s.is_valid():
            s.save()
            return Response(s.data)
        return Response(s.errors, status=400)

    def delete(self, request, pk):
        prize = Prize.objects.filter(pk=pk).first()
        if not prize:
            return Response({'error': 'Not found'}, status=404)
        prize.delete()
        return Response(status=204)


class AdminRedemptionListView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        status_filter = request.query_params.get('status', '')
        qs = Redemption.objects.select_related('user', 'prize').order_by('-redeemed_at')
        if status_filter:
            qs = qs.filter(status=status_filter)
        data = [{
            'id': r.id,
            'user_id': r.user.id,
            'user_name': r.user.name or r.user.phone,
            'user_phone': r.user.phone,
            'prize_id': r.prize.id,
            'prize_name': r.prize.name,
            'points_spent': r.points_spent,
            'status': r.status,
            'redeemed_at': r.redeemed_at,
        } for r in qs[:300]]
        return Response(data)


class AdminRedemptionDetailView(APIView):
    permission_classes = [IsAdminUser]

    def patch(self, request, pk):
        r = Redemption.objects.filter(pk=pk).first()
        if not r:
            return Response({'error': 'Not found'}, status=404)
        new_status = request.data.get('status')
        if new_status not in ('pending', 'fulfilled', 'cancelled'):
            return Response({'error': 'Invalid status'}, status=400)
        r.status = new_status
        r.save(update_fields=['status'])
        return Response({'id': r.id, 'status': r.status})


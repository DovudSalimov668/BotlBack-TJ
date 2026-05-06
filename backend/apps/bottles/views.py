from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.utils import timezone
from .models import Bottle, SKU
from apps.scans.models import Scan
from apps.recycling.models import RecyclingPoint
from apps.achievements.services import check_and_unlock
from apps.achievements.serializers import AchievementSerializer


class VerifyBottleView(APIView):
    permission_classes = [AllowAny]
    def get(self, request, qr_code):
        bottle = Bottle.objects.select_related('sku').filter(qr_code=qr_code).first()
        if not bottle:
            return Response({'error': 'Bottle not found'}, status=404)
        return Response({
            'qr_code': bottle.qr_code,
            'sku': {'name': bottle.sku.name, 'brand': bottle.sku.brand, 'volume_ml': bottle.sku.volume_ml},
            'is_scanned': bottle.is_scanned,
            'is_recycled': bottle.is_recycled,
        })


class ScanBottleView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request):
        qr_code = request.data.get('qr_code', '').strip()
        lat = request.data.get('latitude')
        lon = request.data.get('longitude')
        bottle = Bottle.objects.select_related('sku').filter(qr_code=qr_code).first()
        if not bottle:
            return Response({'error': 'Bottle not found'}, status=404)
        if bottle.is_scanned:
            return Response({'error': 'Already scanned', 'code': 'already_scanned'}, status=409)
        region = request.user.region or 'dushanbe'
        scan = Scan.objects.create(
            bottle=bottle,
            user=request.user,
            scan_type='purchase',
            latitude=lat,
            longitude=lon,
            region=region,
            points_awarded=10,
            created_at=timezone.now(),
        )
        bottle.is_scanned = True
        bottle.save(update_fields=['is_scanned'])
        request.user.bump_streak()
        unlocked = check_and_unlock(request.user)
        return Response({
            'scan_id': scan.id,
            'points_awarded': scan.points_awarded,
            'total_points': request.user.total_points,
            'sku': bottle.sku.name,
            'streak_days': request.user.streak_days,
            'unlocked_achievements': [AchievementSerializer(a).data for a in unlocked],
            'message': 'Бутылка отсканирована!',
        }, status=201)


class RecycleBottleView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request):
        bottle_qr = request.data.get('bottle_qr', '').strip()
        rp_qr = request.data.get('recycling_point_qr', '').strip()
        bottle = Bottle.objects.filter(qr_code=bottle_qr).first()
        if not bottle:
            return Response({'error': 'Bottle not found'}, status=404)
        if not bottle.is_scanned:
            return Response({'error': 'Bottle must be scanned first'}, status=400)
        if bottle.is_recycled:
            return Response({'error': 'Already recycled', 'code': 'already_recycled'}, status=409)
        rp = RecyclingPoint.objects.filter(qr_code=rp_qr, is_active=True).first()
        if not rp:
            return Response({'error': 'Recycling point not found or inactive'}, status=404)
        scan = Scan.objects.create(
            bottle=bottle,
            user=request.user,
            scan_type='recycle',
            latitude=float(rp.latitude),
            longitude=float(rp.longitude),
            region=rp.region,
            points_awarded=20,
            created_at=timezone.now(),
        )
        bottle.is_recycled = True
        bottle.save(update_fields=['is_recycled'])
        request.user.bump_streak()
        unlocked = check_and_unlock(request.user)
        return Response({
            'scan_id': scan.id,
            'points_awarded': scan.points_awarded,
            'total_points': request.user.total_points,
            'co2_saved_kg': request.user.co2_saved_kg,
            'recycling_point': rp.name,
            'streak_days': request.user.streak_days,
            'unlocked_achievements': [AchievementSerializer(a).data for a in unlocked],
        }, status=201)

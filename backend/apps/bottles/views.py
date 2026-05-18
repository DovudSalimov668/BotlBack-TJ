from django.db import transaction
from django.utils import timezone
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.throttling import UserRateThrottle
from rest_framework.views import APIView

from .models import Bottle, SKU
from apps.scans.models import Scan
from apps.recycling.models import RecyclingPoint
from apps.achievements.services import check_and_unlock
from apps.achievements.serializers import AchievementSerializer
from apps.users.models import User


class ScanThrottle(UserRateThrottle):
    rate = '30/min'
    scope = 'scan'


class VerifyBottleView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, qr_code):
        bottle = Bottle.objects.select_related('sku').filter(qr_code=qr_code).first()
        if not bottle:
            return Response({'error': 'Bottle not found'}, status=404)
        return Response({
            'qr_code': bottle.qr_code,
            'sku': {
                'name': bottle.sku.name,
                'brand': bottle.sku.brand,
                'volume_ml': bottle.sku.volume_ml,
                'image_url': bottle.sku.image_url,
            },
            'is_scanned': bottle.is_scanned,
            'is_recycled': bottle.is_recycled,
        })


class ScanBottleView(APIView):
    permission_classes = [IsAuthenticated]
    throttle_classes = [ScanThrottle]

    def post(self, request):
        qr_code = request.data.get('qr_code', '').strip()[:50]
        lat = request.data.get('latitude')
        lon = request.data.get('longitude')

        if lat is not None:
            try:
                lat = float(lat)
                if not (-90 <= lat <= 90):
                    lat = None
            except (TypeError, ValueError):
                lat = None
        if lon is not None:
            try:
                lon = float(lon)
                if not (-180 <= lon <= 180):
                    lon = None
            except (TypeError, ValueError):
                lon = None

        with transaction.atomic():
            # Lock user row first (consistent lock ordering: user → bottle avoids deadlock)
            user = User.objects.select_for_update().get(pk=request.user.pk)
            bottle = Bottle.objects.select_for_update().select_related('sku').filter(qr_code=qr_code).first()
            if not bottle:
                return Response({'error': 'Bottle not found'}, status=404)
            if bottle.is_scanned:
                return Response({'error': 'Already scanned', 'code': 'already_scanned'}, status=409)
            region = user.region or 'dushanbe'
            scan = Scan.objects.create(
                bottle=bottle,
                user=user,
                scan_type='purchase',
                latitude=lat,
                longitude=lon,
                region=region,
                points_awarded=10,
                created_at=timezone.now(),
            )
            bottle.is_scanned = True
            bottle.save(update_fields=['is_scanned'])
            user.bump_streak()

        unlocked = check_and_unlock(user)
        return Response({
            'scan_id': scan.id,
            'points_awarded': scan.points_awarded,
            'total_points': user.total_points,
            'sku': bottle.sku.name,
            'streak_days': user.streak_days,
            'unlocked_achievements': [AchievementSerializer(a).data for a in unlocked],
            'message': 'Бутылка отсканирована!',
        }, status=201)


class RecycleBottleView(APIView):
    permission_classes = [IsAuthenticated]
    throttle_classes = [ScanThrottle]

    def post(self, request):
        bottle_qr = request.data.get('bottle_qr', '').strip()[:50]
        rp_qr = request.data.get('recycling_point_qr', '').strip()[:50]

        with transaction.atomic():
            user = User.objects.select_for_update().get(pk=request.user.pk)
            bottle = Bottle.objects.select_for_update().filter(qr_code=bottle_qr).first()
            if not bottle:
                return Response({'error': 'Bottle not found'}, status=404)
            if not bottle.is_scanned:
                return Response({'error': 'Bottle must be scanned first', 'code': 'not_purchased'}, status=400)
            if bottle.is_recycled:
                return Response({'error': 'Already recycled', 'code': 'already_recycled'}, status=409)
            # Ownership: only the user who purchased this bottle may recycle it
            purchase_scan = Scan.objects.filter(bottle=bottle, scan_type='purchase').first()
            if not purchase_scan or purchase_scan.user_id != user.pk:
                return Response({'error': 'You did not purchase this bottle', 'code': 'not_owner'}, status=403)
            rp = RecyclingPoint.objects.filter(qr_code=rp_qr, is_active=True).first()
            if not rp:
                return Response({'error': 'Recycling point not found or inactive'}, status=404)
            scan = Scan.objects.create(
                bottle=bottle,
                user=user,
                scan_type='recycle',
                latitude=float(rp.latitude),
                longitude=float(rp.longitude),
                region=rp.region,
                points_awarded=20,
                created_at=timezone.now(),
            )
            bottle.is_recycled = True
            bottle.save(update_fields=['is_recycled'])
            user.bump_streak()

        unlocked = check_and_unlock(user)
        return Response({
            'scan_id': scan.id,
            'points_awarded': scan.points_awarded,
            'total_points': user.total_points,
            'co2_saved_kg': user.co2_saved_kg,
            'recycling_point': rp.name,
            'streak_days': user.streak_days,
            'unlocked_achievements': [AchievementSerializer(a).data for a in unlocked],
        }, status=201)

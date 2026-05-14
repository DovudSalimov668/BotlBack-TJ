import uuid
from datetime import timedelta

from django.conf import settings
from django.db import transaction
from django.db.models import Sum, Count
from django.utils import timezone
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.throttling import AnonRateThrottle, UserRateThrottle
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenRefreshView

from .models import User
from .serializers import UserSerializer


class AuthThrottle(AnonRateThrottle):
    rate = '10/min'
    scope = 'auth'


class ScanThrottle(UserRateThrottle):
    rate = '30/min'
    scope = 'scan'


def _generate_referral_code():
    while True:
        code = uuid.uuid4().hex[:8].upper()
        if not User.objects.filter(referral_code=code).exists():
            return code


class RegisterView(APIView):
    permission_classes = [AllowAny]
    throttle_classes = [AuthThrottle]

    def post(self, request):
        phone = request.data.get('phone', '').strip()[:20]
        name = request.data.get('name', '').strip()[:150]
        ref_code = request.data.get('referral_code', '').strip().upper()
        if not phone:
            return Response({'error': 'Phone required'}, status=400)
        if User.objects.filter(phone=phone).exists():
            return Response({'error': 'Phone already registered'}, status=400)
        referrer = None
        if ref_code:
            referrer = User.objects.filter(referral_code=ref_code).first()
        user = User.objects.create_user(phone=phone, name=name, referred_by=referrer)
        user.referral_code = _generate_referral_code()
        user.save(update_fields=['referral_code'])
        if referrer:
            from apps.scans.models import Scan
            from apps.bottles.models import Bottle
            # Award referral bonus via a virtual scan-like entry — use a special scan
            # We create a zero-bottle scan to track the bonus
            Scan.objects.create(
                bottle=None,
                user=referrer,
                scan_type='referral_bonus',
                region=referrer.region or 'dushanbe',
                points_awarded=settings.REFERRAL_BONUS_POINTS,
            )
            Scan.objects.create(
                bottle=None,
                user=user,
                scan_type='referral_bonus',
                region=user.region or 'dushanbe',
                points_awarded=settings.REFERRAL_BONUS_POINTS,
            )
        refresh = RefreshToken.for_user(user)
        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': UserSerializer(user).data,
        }, status=201)


class LoginView(APIView):
    permission_classes = [AllowAny]
    throttle_classes = [AuthThrottle]

    def post(self, request):
        phone = request.data.get('phone', '').strip()[:20]
        otp = request.data.get('otp', '').strip()[:10]
        valid = settings.DEBUG and otp == settings.MOCK_OTP
        if not valid:
            return Response({'error': 'Invalid OTP'}, status=401)
        user = User.objects.filter(phone=phone).first()
        if not user:
            return Response({'error': 'User not found'}, status=404)
        if not user.referral_code:
            user.referral_code = _generate_referral_code()
            user.save(update_fields=['referral_code'])
        refresh = RefreshToken.for_user(user)
        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': UserSerializer(user).data,
        })


class RefreshView(TokenRefreshView):
    pass


class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not request.user.referral_code:
            request.user.referral_code = _generate_referral_code()
            request.user.save(update_fields=['referral_code'])
        return Response(UserSerializer(request.user).data)

    def patch(self, request):
        user = request.user
        name = request.data.get('name', user.name)
        user.name = str(name)[:150]
        lang = request.data.get('language', user.language)
        if lang in ('ru', 'tg'):
            user.language = lang
        region = request.data.get('region', user.region)
        valid_regions = {'dushanbe', 'sughd', 'khatlon', 'gbao', 'rrs'}
        if region in valid_regions:
            user.region = region
        user.save(update_fields=['name', 'language', 'region'])
        return Response(UserSerializer(user).data)


class UserStatsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        from apps.scans.models import Scan
        user_points = user.total_points
        rank = (
            User.objects
            .annotate(pts=Sum('scans__points_awarded'))
            .filter(pts__gt=user_points)
            .count()
        ) + 1
        return Response({
            'total_points': user_points,
            'bottles_recycled': user.bottles_recycled,
            'co2_saved_kg': user.co2_saved_kg,
            'rank': rank,
        })


class MyScanHistoryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        from apps.scans.models import Scan
        limit = min(int(request.query_params.get('limit', 20)), 100)
        scans = (
            Scan.objects
            .filter(user=request.user)
            .select_related('bottle__sku')
            .order_by('-created_at')[:limit]
        )
        data = []
        for s in scans:
            sku_name = 'Coca-Cola'
            if s.bottle and s.bottle.sku:
                sku_name = s.bottle.sku.name
            data.append({
                'id': s.id,
                'scan_type': s.scan_type,
                'points_awarded': s.points_awarded,
                'sku': sku_name,
                'region': s.region,
                'created_at': s.created_at.isoformat(),
            })
        return Response(data)


class LeaderboardView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        from apps.scans.models import Scan
        from django.core.cache import cache
        region = request.query_params.get('region', '')
        period = request.query_params.get('period', 'all')
        cache_key = f'leaderboard:{region}:{period}'
        cached = cache.get(cache_key)
        if cached is not None:
            return Response(cached)

        qs = Scan.objects.filter(user__isnull=False)
        if region:
            qs = qs.filter(region=region)
        if period == 'today':
            qs = qs.filter(created_at__date=timezone.now().date())
        elif period == 'week':
            qs = qs.filter(created_at__gte=timezone.now() - timedelta(days=7))
        elif period == 'month':
            qs = qs.filter(created_at__gte=timezone.now() - timedelta(days=30))

        results = (
            qs.values('user__id', 'user__name', 'user__region')
            .annotate(pts=Sum('points_awarded'), count=Count('id'))
            .order_by('-pts')[:50]
        )
        data = []
        for i, r in enumerate(results, 1):
            name = r['user__name'] or ''
            parts = name.split()
            anon = f"{parts[0]} {parts[1][0]}." if len(parts) > 1 else name
            data.append({
                'rank': i,
                'name': anon,
                'region': r['user__region'],
                'points': r['pts'],
                'bottles': r['count'],
            })
        cache.set(cache_key, data, 120)
        return Response(data)


class MyReferralView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        if not user.referral_code:
            user.referral_code = _generate_referral_code()
            user.save(update_fields=['referral_code'])
        uses = User.objects.filter(referred_by=user).count()
        return Response({
            'code': user.referral_code,
            'uses': uses,
            'bonus_earned': uses * settings.REFERRAL_BONUS_POINTS,
            'share_url': f'https://botlback.tj/join/{user.referral_code}',
        })


class WeeklyChallengesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        from apps.scans.models import Scan
        user = request.user
        week_start = timezone.now() - timedelta(days=7)

        weekly_scans = Scan.objects.filter(user=user, created_at__gte=week_start)
        weekly_purchases = weekly_scans.filter(scan_type='purchase').count()
        weekly_recycles = weekly_scans.filter(scan_type='recycle').count()
        total_recycles = user.bottles_recycled
        referral_count = User.objects.filter(referred_by=user).count()

        challenges = [
            {
                'id': 'recycle_3_week',
                'title': 'Эко-воин недели',
                'description': 'Сдай 3 бутылки на переработку за эту неделю',
                'icon': 'recycle',
                'target': 3,
                'progress': min(weekly_recycles, 3),
                'reward_pts': 30,
                'completed': weekly_recycles >= 3,
                'type': 'weekly',
            },
            {
                'id': 'scan_5_week',
                'title': 'Активный покупатель',
                'description': 'Купи и сканируй 5 бутылок за неделю',
                'icon': 'qr',
                'target': 5,
                'progress': min(weekly_purchases, 5),
                'reward_pts': 20,
                'completed': weekly_purchases >= 5,
                'type': 'weekly',
            },
            {
                'id': 'streak_7',
                'title': 'Несломимая серия',
                'description': 'Поддерживай серию 7 дней подряд',
                'icon': 'flame',
                'target': 7,
                'progress': min(user.streak_days, 7),
                'reward_pts': 50,
                'completed': user.streak_days >= 7,
                'type': 'ongoing',
            },
            {
                'id': 'total_recycle_10',
                'title': 'Первые 10',
                'description': 'Сдай 10 бутылок на переработку всего',
                'icon': 'leaf',
                'target': 10,
                'progress': min(total_recycles, 10),
                'reward_pts': 100,
                'completed': total_recycles >= 10,
                'type': 'milestone',
            },
            {
                'id': 'refer_1',
                'title': 'Позови друга',
                'description': 'Пригласи 1 друга по реферальному коду',
                'icon': 'users',
                'target': 1,
                'progress': min(referral_count, 1),
                'reward_pts': 50,
                'completed': referral_count >= 1,
                'type': 'social',
            },
        ]
        return Response(challenges)

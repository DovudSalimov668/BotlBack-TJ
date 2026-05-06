from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenRefreshView
from rest_framework import status
from django.conf import settings
from .models import User
from .serializers import UserSerializer

class RegisterView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        phone = request.data.get('phone', '').strip()
        name = request.data.get('name', '').strip()
        if not phone:
            return Response({'error': 'Phone required'}, status=400)
        if User.objects.filter(phone=phone).exists():
            return Response({'error': 'Phone already registered'}, status=400)
        user = User.objects.create_user(phone=phone, name=name)
        refresh = RefreshToken.for_user(user)
        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': UserSerializer(user).data,
        }, status=201)

class LoginView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        phone = request.data.get('phone', '').strip()
        otp = request.data.get('otp', '').strip()
        if settings.DEBUG and otp == settings.MOCK_OTP:
            valid = True
        else:
            valid = False
        if not valid:
            return Response({'error': 'Invalid OTP'}, status=401)
        user = User.objects.filter(phone=phone).first()
        if not user:
            return Response({'error': 'User not found'}, status=404)
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
        return Response(UserSerializer(request.user).data)
    def patch(self, request):
        user = request.user
        user.name = request.data.get('name', user.name)
        user.language = request.data.get('language', user.language)
        user.region = request.data.get('region', user.region)
        user.save()
        return Response(UserSerializer(user).data)

class UserStatsView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        user = request.user
        from apps.scans.models import Scan
        from django.db.models import Sum
        rank = User.objects.filter(
            scans__isnull=False
        ).annotate(pts=Sum('scans__points_awarded')).filter(
            pts__gt=user.total_points
        ).count() + 1
        return Response({
            'total_points': user.total_points,
            'bottles_recycled': user.bottles_recycled,
            'co2_saved_kg': user.co2_saved_kg,
            'rank': rank,
        })

class LeaderboardView(APIView):
    permission_classes = [AllowAny]
    def get(self, request):
        from apps.scans.models import Scan
        from django.db.models import Sum, Count
        region = request.query_params.get('region', '')
        period = request.query_params.get('period', 'all')
        from django.utils import timezone
        from datetime import timedelta
        qs = Scan.objects.filter(user__isnull=False)
        if region:
            qs = qs.filter(region=region)
        if period == 'today':
            qs = qs.filter(created_at__date=timezone.now().date())
        elif period == 'week':
            qs = qs.filter(created_at__gte=timezone.now() - timedelta(days=7))
        elif period == 'month':
            qs = qs.filter(created_at__gte=timezone.now() - timedelta(days=30))
        results = qs.values('user__id', 'user__name', 'user__region').annotate(
            pts=Sum('points_awarded'), count=Count('id')
        ).order_by('-pts')[:50]
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
        return Response(data)

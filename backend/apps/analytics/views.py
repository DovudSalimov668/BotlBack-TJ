from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser
from django.db.models import Count, Sum, Q
from django.db.models.functions import TruncDate, TruncHour
from django.utils import timezone
from datetime import timedelta
from apps.scans.models import Scan
from apps.users.models import User
from apps.recycling.models import RecyclingPoint
from apps.bottles.models import SKU, Bottle
from .models import Campaign


class OverviewView(APIView):
    permission_classes = [IsAdminUser]
    def get(self, request):
        today = timezone.now().date()
        yesterday = today - timedelta(days=1)
        scans_today = Scan.objects.filter(created_at__date=today)
        scans_yesterday = Scan.objects.filter(created_at__date=yesterday)
        total_today = scans_today.count()
        recycled_today = scans_today.filter(scan_type='recycle').count()
        purchased_today = scans_today.filter(scan_type='purchase').count()
        total_yesterday = scans_yesterday.count()
        recycled_yesterday = scans_yesterday.filter(scan_type='recycle').count()
        recycling_rate = round(recycled_today / purchased_today * 100, 1) if purchased_today else 0
        recycling_rate_yesterday = round(recycled_yesterday / (scans_yesterday.filter(scan_type='purchase').count() or 1) * 100, 1)
        users_today = scans_today.values('user').distinct().count()
        co2_today = round(recycled_today * 0.082, 2)
        top_region = scans_today.values('region').annotate(cnt=Count('id')).order_by('-cnt').first()
        recent_scans = Scan.objects.filter(
            scan_type='recycle', user__isnull=False
        ).select_related('user', 'bottle__sku').order_by('-created_at')[:10]
        feed = []
        recent_all = Scan.objects.filter(
            user__isnull=False
        ).select_related('user', 'bottle__sku').order_by('-created_at')[:12]
        for s in recent_all:
            name = s.user.name or s.user.phone
            parts = name.split()
            anon = f"{parts[0]} {parts[1][0]}." if len(parts) > 1 else name
            sku_name = s.bottle.sku.name if s.bottle and s.bottle.sku else 'бутылку'
            if s.scan_type == 'recycle':
                text = f"{anon} сдал(а) {sku_name} на переработку (+20 pts)"
            else:
                text = f"{anon} купил(а) {sku_name} (+10 pt)"
            feed.append({
                'text': text,
                'region': s.region or 'dushanbe',
                'type': s.scan_type,
                'time': s.created_at.isoformat(),
            })
        return Response({
            'bottles_today': total_today,
            'bottles_yesterday': total_yesterday,
            'active_users': users_today,
            'recycling_rate': recycling_rate,
            'recycling_rate_yesterday': recycling_rate_yesterday,
            'co2_saved_kg': co2_today,
            'top_region': top_region['region'] if top_region else 'dushanbe',
            'live_feed': feed,
        })


class TimeSeriesView(APIView):
    permission_classes = [IsAdminUser]
    def get(self, request):
        metric = request.query_params.get('metric', 'scans')
        period = request.query_params.get('period', '30d')
        days = {'7d': 7, '30d': 30, '90d': 90}.get(period, 30)
        since = timezone.now() - timedelta(days=days)
        qs = Scan.objects.filter(created_at__gte=since)
        if metric == 'recycled':
            qs = qs.filter(scan_type='recycle')
        elif metric == 'purchased':
            qs = qs.filter(scan_type='purchase')
        data = qs.annotate(date=TruncDate('created_at')).values('date').annotate(
            value=Count('id')
        ).order_by('date')
        return Response([{'date': str(d['date']), 'value': d['value']} for d in data])


class MapView(APIView):
    permission_classes = [IsAdminUser]
    def get(self, request):
        points = RecyclingPoint.objects.filter(is_active=True).annotate(
            scan_count=Count('qr_code')
        )
        scans_by_rp = {}
        for s in Scan.objects.filter(scan_type='recycle', latitude__isnull=False).values('latitude', 'longitude').annotate(cnt=Count('id')):
            key = (float(s['latitude']), float(s['longitude']))
            scans_by_rp[key] = s['cnt']
        result = []
        for rp in points:
            result.append({
                'id': rp.id,
                'name': rp.name,
                'lat': float(rp.latitude),
                'lon': float(rp.longitude),
                'region': rp.region,
                'scan_count': scans_by_rp.get((float(rp.latitude), float(rp.longitude)), 0),
                'is_active': rp.is_active,
            })
        return Response(result)


class RegionsView(APIView):
    permission_classes = [IsAdminUser]
    def get(self, request):
        regions = ['dushanbe', 'sughd', 'khatlon', 'gbao', 'rrs']
        result = []
        for region in regions:
            purchased = Scan.objects.filter(region=region, scan_type='purchase').count()
            recycled = Scan.objects.filter(region=region, scan_type='recycle').count()
            rate = round(recycled / purchased * 100, 1) if purchased else 0
            result.append({
                'region': region,
                'bottles_purchased': purchased,
                'bottles_recycled': recycled,
                'recycling_rate': rate,
                'users': Scan.objects.filter(region=region).values('user').distinct().count(),
            })
        return Response(result)


class SKUsView(APIView):
    permission_classes = [IsAdminUser]
    def get(self, request):
        skus = SKU.objects.annotate(
            scanned=Count('bottles', filter=Q(bottles__is_scanned=True)),
            recycled=Count('bottles', filter=Q(bottles__is_recycled=True)),
            total=Count('bottles'),
        )
        result = []
        for sku in skus:
            result.append({
                'id': sku.id,
                'name': sku.name,
                'brand': sku.brand,
                'total_bottles': sku.total,
                'scanned': sku.scanned,
                'recycled': sku.recycled,
                'recycling_rate': round(sku.recycled / sku.scanned * 100, 1) if sku.scanned else 0,
            })
        return Response(result)


class CampaignsView(APIView):
    permission_classes = [IsAdminUser]
    def get(self, request):
        campaigns = Campaign.objects.all()
        result = []
        for c in campaigns:
            from apps.scans.models import Scan as ScanModel
            bottles = Scan.objects.filter(
                created_at__date__gte=c.start_date,
                created_at__date__lte=c.end_date,
            ).count()
            result.append({
                'id': c.id,
                'name': c.name,
                'description': c.description,
                'start_date': str(c.start_date),
                'end_date': str(c.end_date),
                'bottles_tracked': bottles,
                'target_bottles': c.target_bottles,
                'is_active': c.is_active,
                'progress_pct': round(bottles / c.target_bottles * 100, 1) if c.target_bottles else 0,
            })
        return Response(result)

    def post(self, request):
        from .models import Campaign
        from datetime import date
        c = Campaign.objects.create(
            name=request.data.get('name', 'New Campaign'),
            description=request.data.get('description', ''),
            start_date=request.data.get('start_date', str(date.today())),
            end_date=request.data.get('end_date', str(date.today())),
            target_bottles=request.data.get('target_bottles', 10000),
        )
        return Response({'id': c.id, 'name': c.name}, status=201)

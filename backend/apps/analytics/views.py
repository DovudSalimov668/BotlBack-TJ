from django.core.cache import cache
from django.db.models import Count, Sum, Q
from django.db.models.functions import TruncDate
from django.utils import timezone
from datetime import timedelta
from rest_framework.permissions import IsAdminUser, AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.scans.models import Scan
from apps.users.models import User
from apps.recycling.models import RecyclingPoint
from apps.bottles.models import SKU
from .models import Campaign

REGIONS = ['dushanbe', 'sughd', 'khatlon', 'gbao', 'rrs']


class OverviewView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        cached = cache.get('analytics:overview')
        if cached:
            return Response(cached)

        today = timezone.now().date()
        yesterday = today - timedelta(days=1)

        agg = (
            Scan.objects
            .filter(created_at__date__in=[today, yesterday])
            .values('created_at__date', 'scan_type')
            .annotate(cnt=Count('id'))
        )
        users_today = (
            Scan.objects
            .filter(created_at__date=today)
            .aggregate(users=Count('user', distinct=True))['users']
        )

        counts = {}
        for row in agg:
            d = str(row['created_at__date'])
            t = row['scan_type']
            counts.setdefault(d, {})[t] = row['cnt']

        t_key = str(today)
        y_key = str(yesterday)
        purchased_today = counts.get(t_key, {}).get('purchase', 0)
        recycled_today = counts.get(t_key, {}).get('recycle', 0)
        purchased_yesterday = counts.get(y_key, {}).get('purchase', 0)
        recycled_yesterday = counts.get(y_key, {}).get('recycle', 0)
        total_today = purchased_today + recycled_today
        total_yesterday = purchased_yesterday + recycled_yesterday

        recycling_rate = round(recycled_today / purchased_today * 100, 1) if purchased_today else 0
        recycling_rate_yesterday = round(recycled_yesterday / purchased_yesterday * 100, 1) if purchased_yesterday else 0
        co2_today = round(recycled_today * 0.082, 2)

        top_region_row = (
            Scan.objects
            .filter(created_at__date=today)
            .values('region')
            .annotate(cnt=Count('id'))
            .order_by('-cnt')
            .first()
        )

        recent_all = (
            Scan.objects
            .filter(user__isnull=False)
            .select_related('user', 'bottle__sku')
            .order_by('-created_at')[:12]
        )
        feed = []
        for s in recent_all:
            name = s.user.name or s.user.phone
            parts = name.split()
            anon = f"{parts[0]} {parts[1][0]}." if len(parts) > 1 else name
            sku_name = s.bottle.sku.name if s.bottle and s.bottle.sku else 'бутылку'
            if s.scan_type == 'recycle':
                text = f"{anon} сдал(а) {sku_name} на переработку (+20 pts)"
            else:
                text = f"{anon} купил(а) {sku_name} (+10 pts)"
            feed.append({
                'id': s.id,
                'text': text,
                'region': s.region or 'dushanbe',
                'type': s.scan_type,
                'time': s.created_at.isoformat(),
            })

        result = {
            'bottles_today': total_today,
            'bottles_yesterday': total_yesterday,
            'active_users': users_today,
            'recycling_rate': recycling_rate,
            'recycling_rate_yesterday': recycling_rate_yesterday,
            'co2_saved_kg': co2_today,
            'top_region': top_region_row['region'] if top_region_row else 'dushanbe',
            'live_feed': feed,
        }
        cache.set('analytics:overview', result, 60)
        return Response(result)


class LiveFeedView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        since_param = request.query_params.get('since', '')
        qs = (
            Scan.objects
            .filter(user__isnull=False)
            .select_related('user', 'bottle__sku')
            .order_by('-created_at')
        )
        if since_param:
            try:
                from django.utils.dateparse import parse_datetime
                since_dt = parse_datetime(since_param)
                if since_dt:
                    qs = qs.filter(created_at__gt=since_dt)
            except Exception:
                pass
        feed = []
        for s in qs[:20]:
            name = s.user.name or s.user.phone
            parts = name.split()
            anon = f"{parts[0]} {parts[1][0]}." if len(parts) > 1 else name
            sku_name = s.bottle.sku.name if s.bottle and s.bottle.sku else 'бутылку'
            if s.scan_type == 'recycle':
                text = f"{anon} сдал(а) {sku_name} на переработку (+20 pts)"
            else:
                text = f"{anon} купил(а) {sku_name} (+10 pts)"
            feed.append({
                'id': s.id,
                'text': text,
                'region': s.region or 'dushanbe',
                'type': s.scan_type,
                'time': s.created_at.isoformat(),
            })
        return Response(feed)


class TimeSeriesView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        metric = request.query_params.get('metric', 'scans')
        period = request.query_params.get('period', '30d')
        days = {'7d': 7, '30d': 30, '90d': 90}.get(period, 30)
        cache_key = f'analytics:timeseries:{metric}:{period}'
        cached = cache.get(cache_key)
        if cached:
            return Response(cached)

        since = timezone.now() - timedelta(days=days)
        qs = Scan.objects.filter(created_at__gte=since)
        if metric == 'recycled':
            qs = qs.filter(scan_type='recycle')
        elif metric == 'purchased':
            qs = qs.filter(scan_type='purchase')

        data = list(
            qs.annotate(date=TruncDate('created_at'))
            .values('date')
            .annotate(value=Count('id'))
            .order_by('date')
            .values_list('date', 'value')
        )
        result = [{'date': str(d), 'value': v} for d, v in data]
        cache.set(cache_key, result, 300)
        return Response(result)


class MapView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        cached = cache.get('analytics:map')
        if cached:
            return Response(cached)

        scans_by_coord = {}
        for s in (
            Scan.objects
            .filter(scan_type='recycle', latitude__isnull=False, longitude__isnull=False)
            .values('latitude', 'longitude')
            .annotate(cnt=Count('id'))
        ):
            key = (float(s['latitude']), float(s['longitude']))
            scans_by_coord[key] = s['cnt']

        result = []
        for rp in RecyclingPoint.objects.filter(is_active=True):
            lat, lon = float(rp.latitude), float(rp.longitude)
            result.append({
                'id': rp.id,
                'name': rp.name,
                'lat': lat,
                'lon': lon,
                'region': rp.region,
                'scan_count': scans_by_coord.get((lat, lon), 0),
                'is_active': rp.is_active,
            })
        cache.set('analytics:map', result, 300)
        return Response(result)


class RegionsView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        cached = cache.get('analytics:regions')
        if cached:
            return Response(cached)

        scan_agg = (
            Scan.objects
            .filter(region__in=REGIONS)
            .values('region', 'scan_type')
            .annotate(cnt=Count('id'))
        )
        user_agg = (
            Scan.objects
            .filter(region__in=REGIONS)
            .values('region')
            .annotate(users=Count('user', distinct=True))
        )

        data = {r: {'purchased': 0, 'recycled': 0, 'users': 0} for r in REGIONS}
        for row in scan_agg:
            r = row['region']
            if r in data:
                if row['scan_type'] == 'purchase':
                    data[r]['purchased'] = row['cnt']
                elif row['scan_type'] == 'recycle':
                    data[r]['recycled'] = row['cnt']
        for row in user_agg:
            r = row['region']
            if r in data:
                data[r]['users'] = row['users']

        result = []
        for region in REGIONS:
            d = data[region]
            rate = round(d['recycled'] / d['purchased'] * 100, 1) if d['purchased'] else 0
            result.append({
                'region': region,
                'bottles_purchased': d['purchased'],
                'bottles_recycled': d['recycled'],
                'recycling_rate': rate,
                'users': d['users'],
            })
        cache.set('analytics:regions', result, 120)
        return Response(result)


class SKUsView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        cached = cache.get('analytics:skus')
        if cached:
            return Response(cached)

        skus = SKU.objects.annotate(
            scanned=Count('bottles', filter=Q(bottles__is_scanned=True)),
            recycled=Count('bottles', filter=Q(bottles__is_recycled=True)),
            total=Count('bottles'),
        )
        result = [
            {
                'id': sku.id,
                'name': sku.name,
                'brand': sku.brand,
                'image_url': sku.image_url,
                'total_bottles': sku.total,
                'scanned': sku.scanned,
                'recycled': sku.recycled,
                'recycling_rate': round(sku.recycled / sku.scanned * 100, 1) if sku.scanned else 0,
            }
            for sku in skus
        ]
        cache.set('analytics:skus', result, 300)
        return Response(result)


class CommunityStatsView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        cached = cache.get('analytics:community')
        if cached:
            return Response(cached)

        total_users = User.objects.filter(is_active=True).count()
        recycled = Scan.objects.filter(scan_type='recycle').count()
        co2_kg = round(recycled * 0.082, 1)
        total_scans = Scan.objects.filter(scan_type__in=['purchase', 'recycle']).count()
        result = {
            'total_users': total_users,
            'bottles_recycled': recycled,
            'total_scans': total_scans,
            'co2_saved_kg': co2_kg,
        }
        cache.set('analytics:community', result, 120)
        return Response(result)


class CampaignsView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        campaigns = Campaign.objects.all()
        result = []
        for c in campaigns:
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
        from datetime import date
        c = Campaign.objects.create(
            name=str(request.data.get('name', 'New Campaign'))[:200],
            description=str(request.data.get('description', ''))[:2000],
            start_date=request.data.get('start_date', str(date.today())),
            end_date=request.data.get('end_date', str(date.today())),
            target_bottles=int(request.data.get('target_bottles', 10000)),
        )
        return Response({'id': c.id, 'name': c.name}, status=201)


class CampaignDetailView(APIView):
    permission_classes = [IsAdminUser]

    def patch(self, request, pk):
        c = Campaign.objects.filter(pk=pk).first()
        if not c:
            return Response({'error': 'Not found'}, status=404)
        if 'name' in request.data:
            c.name = str(request.data['name'])[:200]
        if 'description' in request.data:
            c.description = str(request.data['description'])[:2000]
        if 'start_date' in request.data:
            c.start_date = request.data['start_date']
        if 'end_date' in request.data:
            c.end_date = request.data['end_date']
        if 'target_bottles' in request.data:
            c.target_bottles = int(request.data['target_bottles'])
        if 'is_active' in request.data:
            c.is_active = bool(request.data['is_active'])
        c.save()
        return Response({'id': c.id, 'name': c.name, 'is_active': c.is_active})

    def delete(self, request, pk):
        c = Campaign.objects.filter(pk=pk).first()
        if not c:
            return Response({'error': 'Not found'}, status=404)
        c.delete()
        return Response(status=204)

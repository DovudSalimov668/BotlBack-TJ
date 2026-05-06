import random
import string
from datetime import date, datetime, timedelta
from zoneinfo import ZoneInfo

from django.core.management.base import BaseCommand
from django.utils import timezone

TJ = ZoneInfo('Asia/Dushanbe')

TAJIK_FIRST_NAMES = [
    'Азиз', 'Дилшод', 'Рустам', 'Бехруз', 'Джамшед', 'Шахзод', 'Баходур', 'Фируз',
    'Хуршед', 'Камол', 'Зафар', 'Сироджиддин', 'Мухаммад', 'Алишер', 'Тимур',
    'Фарангиз', 'Манижа', 'Нилуфар', 'Ситора', 'Мадина', 'Гулнора', 'Нозима',
    'Нарима', 'Дилноза', 'Сабина', 'Зарина', 'Шахло', 'Наргис', 'Мунира', 'Лайло',
]
TAJIK_LAST_NAMES = [
    'Каримов', 'Рахимов', 'Саидов', 'Назаров', 'Миров', 'Холов', 'Турсунов',
    'Усмонов', 'Ахмедов', 'Юсупов', 'Баротов', 'Маматов', 'Эргашев', 'Султонов',
    'Хасанов', 'Каримова', 'Рахимова', 'Саидова', 'Назарова', 'Турсунова',
    'Ахмедова', 'Юсупова', 'Маматова', 'Эргашева', 'Султонова', 'Хасанова',
]

RECYCLING_POINTS = [
    ('Базар Мехргон — пункт приёма', 'Бозори Меҳргон — нуқтаи қабул', '55 Проспект Рудаки, Душанбе', 38.5598, 68.7870, 'dushanbe', 'RP-DEMO-001'),
    ('ТЦ Душанбе Сити — пункт приёма', 'МТ Душанбе Сити — нуқтаи қабул', 'ул. Борбад 5, Душанбе', 38.5634, 68.7793, 'dushanbe', 'RP-DS-002'),
    ('Зелёный базар — пункт приёма', 'Бозори Сабз — нуқтаи қабул', 'Зелёный базар, Душанбе', 38.5555, 68.7742, 'dushanbe', 'RP-DS-003'),
    ('Супермаркет Корвон — пункт приёма', 'Супермаркети Корвон', 'ул. Корвон 12, Душанбе', 38.5700, 68.7950, 'dushanbe', 'RP-DS-004'),
    ('Парк Рудаки — пункт приёма', 'Боғи Рудакӣ — нуқтаи қабул', 'Проспект Рудаки, Душанбе', 38.5612, 68.7831, 'dushanbe', 'RP-DS-005'),
    ('Ботанический сад — пункт приёма', 'Боғи Ботаникӣ', 'ул. Айни 299, Душанбе', 38.5500, 68.7710, 'dushanbe', 'RP-DS-006'),
    ('Магазин Пайкар — пункт приёма', 'Дӯкони Пайкар', 'район Сино, Душанбе', 38.5680, 68.8010, 'dushanbe', 'RP-DS-007'),
    ('Супермаркет Навруз — пункт приёма', 'Супермаркети Навруз', 'район Исмоили Сомони, Душанбе', 38.5820, 68.8100, 'dushanbe', 'RP-DS-008'),
    ('Центральный рынок Файзобод', 'Бозори марказии Файзобод', 'ул. Садриддина Айни, Душанбе', 38.5450, 68.7900, 'dushanbe', 'RP-DS-009'),
    ('АЗС TOTAL Шохмансур', 'АЗС TOTAL Шоҳмансур', 'Шохмансур, Душанбе', 38.5390, 68.7760, 'dushanbe', 'RP-DS-010'),
    ('Магазин Амонат — Фирдавси', 'Дӯкони Амонат — Фирдавсӣ', 'район Фирдавси, Душанбе', 38.5750, 68.7680, 'dushanbe', 'RP-DS-011'),
    ('Школа №38 — пункт приёма', 'Мактаби №38 — нуқтаи қабул', 'Исмоили Сомони, Душанбе', 38.5870, 68.8200, 'dushanbe', 'RP-DS-012'),
    ('Рынок Саховат', 'Бозори Саховат', 'ул. Чехова, Душанбе', 38.5510, 68.7830, 'dushanbe', 'RP-DS-013'),
    ('Гипермаркет ORZU — пункт приёма', 'Гипермаркети ORZU', 'Проспект Борбад, Душанбе', 38.5648, 68.7920, 'dushanbe', 'RP-DS-014'),
    ('Хотель Хаят — пункт приёма', 'Меҳмонхонаи Хаят', 'Проспект Рудаки, Душанбе', 38.5587, 68.7845, 'dushanbe', 'RP-DS-015'),
    ('Худжанд — базар Панчшанбе', 'Хуҷанд — Бозори Панҷшанбе', 'бул. Ленин, Худжанд', 40.2839, 69.6218, 'sughd', 'RP-KH-001'),
    ('Худжанд — ТЦ Нур', 'Хуҷанд — МТ Нур', 'ул. Камол, Худжанд', 40.2900, 69.6300, 'sughd', 'RP-KH-002'),
    ('Худжанд — супермаркет Форум', 'Хуҷанд — Форум', 'Центр, Худжанд', 40.2780, 69.6100, 'sughd', 'RP-KH-003'),
    ('Худжанд — рынок Атлас', 'Хуҷанд — Бозори Атлас', 'ул. Атлас, Худжанд', 40.2860, 69.6350, 'sughd', 'RP-KH-004'),
    ('Чкаловск — магазин Ориён', 'Чкаловск — Ориён', 'ул. Ленина, Чкаловск', 40.2230, 69.6840, 'sughd', 'RP-KH-005'),
    ('Истаравшан — центральный рынок', 'Истаравшан — Бозори марказӣ', 'Центр, Истаравшан', 39.9147, 69.0042, 'sughd', 'RP-KH-006'),
    ('Бустон — пункт приёма', 'Бустон — нуқтаи қабул', 'ул. Навруз, Бустон', 40.5490, 69.6970, 'sughd', 'RP-KH-007'),
    ('Спитамен — магазин', 'Спитамен — дӯкон', 'Центр, Спитамен', 40.4890, 69.8990, 'sughd', 'RP-KH-008'),
    ('Бохтар — базар', 'Бохтар — бозор', 'Центр, Бохтар', 37.8299, 68.7826, 'khatlon', 'RP-BK-001'),
    ('Бохтар — супермаркет', 'Бохтар — супермаркет', 'ул. Рудаки, Бохтар', 37.8350, 68.7900, 'khatlon', 'RP-BK-002'),
    ('Кулоб — базар Дусти', 'Кӯлоб — бозор', 'Центр, Кулоб', 37.9160, 69.7860, 'khatlon', 'RP-BK-003'),
    ('Вахш — пункт приёма', 'Вахш — нуқтаи қабул', 'ул. Ленина, Вахш', 37.6900, 68.8300, 'khatlon', 'RP-BK-004'),
    ('Хорог — базар', 'Хоруғ — бозор', 'Центр, Хорог', 37.4897, 71.5512, 'gbao', 'RP-KG-001'),
    ('Ховалинг — пункт приёма', 'Ховалинг — нуқтаи қабул', 'Ховалинг', 38.3640, 70.0180, 'rrs', 'RP-RRS-001'),
    ('Раштский базар — пункт приёма', 'Бозори Рашт', 'Центр, Рашт', 38.8810, 69.9260, 'rrs', 'RP-RRS-002'),
]

SKUS = [
    ('Coca-Cola 0.5L PET', 'coca-cola', 500, 'PET'),
    ('Coca-Cola 1.5L PET', 'coca-cola', 1500, 'PET'),
    ('Fanta Апельсин 0.5L PET', 'fanta', 500, 'PET'),
    ('Sprite 1L PET', 'sprite', 1000, 'PET'),
    ('Bonaqua 0.5L PET', 'bonaqua', 500, 'PET'),
]

PRIZES = [
    ('5 сом на Alif Mobi', '5 сомонӣ ба Alif Mobi', 50, 10),
    ('10 сом на Alif Mobi', '10 сомонӣ ба Alif Mobi', 90, 5),
    ('25 сом на Alif Mobi', '25 сомонӣ ба Alif Mobi', 200, 3),
    ('Бесплатная Bonaqua 0.5L', 'Bonaqua 0.5L ройгон', 30, 50),
    ('Сумка Coca-Cola', 'Сумкаи Coca-Cola', 150, 20),
    ('Футболка Coca-Cola', 'Куртаи Coca-Cola', 300, 10),
    ('Магнит Coca-Cola', 'Оҳанрабои Coca-Cola', 20, 100),
    ('Бесплатный Fuse Tea', 'Fuse Tea ройгон', 25, 30),
]

REGION_WEIGHTS = {'dushanbe': 60, 'sughd': 20, 'khatlon': 12, 'gbao': 3, 'rrs': 5}
RECYCLING_RATES = {'dushanbe': 0.65, 'sughd': 0.40, 'khatlon': 0.30, 'gbao': 0.25, 'rrs': 0.20}


def gen_qr(prefix='BTL', length=8):
    chars = string.ascii_uppercase + string.digits
    return f"{prefix}-{''.join(random.choices(chars, k=4))}-{''.join(random.choices(chars, k=4))}"


def get_random_hour():
    weights = [2, 1, 1, 1, 1, 2, 5, 10, 15, 18, 20, 22, 25, 22, 18, 15, 18, 20, 28, 25, 20, 15, 8, 4]
    return random.choices(range(24), weights=weights, k=1)[0]


def random_dt_in_range(start_date, end_date):
    delta = (end_date - start_date).days
    day = start_date + timedelta(days=random.randint(0, delta))
    hour = get_random_hour()
    minute = random.randint(0, 59)
    return datetime(day.year, day.month, day.day, hour, minute, tzinfo=TJ)


class Command(BaseCommand):
    help = 'Seed demo data for BotlBack TJ'

    def handle(self, *args, **options):
        from apps.users.models import User
        from apps.bottles.models import SKU, Bottle
        from apps.scans.models import Scan
        from apps.recycling.models import RecyclingPoint
        from apps.rewards.models import Prize, Redemption
        from apps.analytics.models import Campaign

        self.stdout.write('🧹 Clearing existing data...')
        Redemption.objects.all().delete()
        Scan.objects.all().delete()
        Bottle.objects.all().delete()
        RecyclingPoint.objects.all().delete()
        Prize.objects.all().delete()
        Campaign.objects.all().delete()
        SKU.objects.all().delete()
        User.objects.filter(is_superuser=False).delete()

        self.stdout.write('👤 Creating admin user...')
        if not User.objects.filter(phone='admin').exists():
            admin = User.objects.create_user(phone='admin', name='Admin')
            admin.set_password('Botlback2026!')
            admin.is_staff = True
            admin.is_superuser = True
            admin.save()
        else:
            admin = User.objects.get(phone='admin')

        self.stdout.write('📦 Creating SKUs...')
        sku_objs = []
        for name, brand, vol, pkg in SKUS:
            sku = SKU.objects.create(name=name, brand=brand, volume_ml=vol, package_type=pkg)
            sku_objs.append(sku)

        self.stdout.write('📍 Creating recycling points...')
        for name, name_tg, addr, lat, lon, region, qr in RECYCLING_POINTS:
            RecyclingPoint.objects.get_or_create(
                qr_code=qr,
                defaults=dict(name=name, name_tg=name_tg, address=addr, latitude=lat, longitude=lon, region=region)
            )
        rp_by_region = {r: list(RecyclingPoint.objects.filter(region=r)) for r in REGION_WEIGHTS}

        self.stdout.write('🎁 Creating prizes...')
        for name, name_tg, cost, stock in PRIZES:
            Prize.objects.create(name=name, name_tg=name_tg, points_cost=cost, stock_quantity=stock)

        self.stdout.write('👥 Creating 150 users...')
        regions = list(REGION_WEIGHTS.keys())
        region_weights = list(REGION_WEIGHTS.values())
        users = []
        for i in range(150):
            first = random.choice(TAJIK_FIRST_NAMES)
            last = random.choice(TAJIK_LAST_NAMES)
            region = random.choices(regions, weights=region_weights, k=1)[0]
            phone = f"+992{random.randint(900000002, 999999999)}"
            user = User.objects.create_user(
                phone=phone,
                name=f"{first} {last}",
                region=region,
            )
            users.append(user)

        self.stdout.write('🍾 Creating 2000 bottles...')
        bottles = []
        magic_qrs = ['BTL-DEMO-0001', 'BTL-DEMO-0002']
        for mqr in magic_qrs:
            b = Bottle.objects.create(
                qr_code=mqr,
                sku=sku_objs[0],
                batch_number='DEMO-BATCH',
                produced_at=date(2026, 1, 1),
            )
            bottles.append(b)
        for i in range(1998):
            sku = random.choice(sku_objs)
            qr = gen_qr()
            while Bottle.objects.filter(qr_code=qr).exists():
                qr = gen_qr()
            b = Bottle.objects.create(
                qr_code=qr,
                sku=sku,
                batch_number=f"BATCH-{random.randint(1000, 9999)}",
                produced_at=date(2026, random.randint(1, 4), random.randint(1, 28)),
            )
            bottles.append(b)

        self.stdout.write('📱 Creating ~3500 scans over 30 days...')
        end_date = date.today()
        start_date = end_date - timedelta(days=30)
        scan_objs = []
        # Reserve 33 bottles for demo user; use at most 1965 for main pool
        all_regular = list(Bottle.objects.exclude(qr_code__in=magic_qrs).order_by('?'))
        random.shuffle(all_regular)
        demo_reserve = all_regular[:33]
        demo_reserve_pks = {b.pk for b in demo_reserve}
        bottle_pool = [b for b in all_regular[33:] if b.pk not in demo_reserve_pks][:1965]
        random.shuffle(bottle_pool)

        # Generate purchase-first: for each bottle, optionally follow with recycle.
        # This guarantees recycle_count <= purchase_count per region (no >100% rates).
        for bottle in bottle_pool:
            user = random.choice(users)
            region = user.region
            rps = rp_by_region.get(region, rp_by_region['dushanbe'])
            dt_purchase = random_dt_in_range(start_date, end_date)
            scan_objs.append(Scan(
                bottle=bottle,
                user=user,
                scan_type='purchase',
                region=region,
                points_awarded=10,
                created_at=dt_purchase,
            ))
            bottle.is_scanned = True

            if random.random() < RECYCLING_RATES.get(region, 0.3):
                rp = random.choice(rps) if rps else None
                # Recycle happens 1-14 days after purchase
                offset_days = random.randint(1, 14)
                dt_recycle = dt_purchase + timedelta(days=offset_days)
                end_dt = datetime(end_date.year, end_date.month, end_date.day, 23, 59, tzinfo=TJ)
                if dt_recycle > end_dt:
                    dt_recycle = random_dt_in_range(start_date, end_date)
                scan_objs.append(Scan(
                    bottle=bottle,
                    user=random.choice(users),
                    scan_type='recycle',
                    latitude=float(rp.latitude) if rp else None,
                    longitude=float(rp.longitude) if rp else None,
                    region=region,
                    points_awarded=20,
                    created_at=dt_recycle,
                ))
                bottle.is_recycled = True

        Scan.objects.bulk_create(scan_objs, ignore_conflicts=True)
        Bottle.objects.bulk_update(
            [b for b in bottle_pool if b.is_scanned or b.is_recycled],
            ['is_scanned', 'is_recycled'],
            batch_size=500,
        )

        self.stdout.write('🌟 Creating demo consumer (+992900000001)...')
        demo_user, _ = User.objects.get_or_create(
            phone='+992900000001',
            defaults={'name': 'Комрон Рустамов', 'region': 'dushanbe'}
        )
        prize = Prize.objects.first()
        demo_bottles = demo_reserve[:30]
        for i, b in enumerate(demo_bottles[:30]):
            b.is_scanned = True
            Scan.objects.create(
                bottle=b, user=demo_user, scan_type='purchase',
                region='dushanbe', points_awarded=10,
                created_at=datetime(2026, 4, 10 + i // 3, 12, 0, tzinfo=TJ)
            )
        Bottle.objects.bulk_update(demo_bottles[:30], ['is_scanned'])
        for i, b in enumerate(demo_bottles[:23]):
            b.is_recycled = True
            rp = RecyclingPoint.objects.filter(region='dushanbe').first()
            Scan.objects.create(
                bottle=b, user=demo_user, scan_type='recycle',
                latitude=float(rp.latitude), longitude=float(rp.longitude),
                region='dushanbe', points_awarded=20,
                created_at=datetime(2026, 4, 11 + i // 3, 18, 30, tzinfo=TJ)
            )
        Bottle.objects.bulk_update(demo_bottles[:23], ['is_recycled'])
        if prize:
            Redemption.objects.create(
                user=demo_user, prize=prize, points_spent=prize.points_cost, status='pending'
            )

        self.stdout.write('📅 Creating campaigns...')
        Campaign.objects.create(
            name='Навруз 2026 — Переработай!',
            description='Специальная акция Навруз: +2x очки за переработку с 21 по 31 марта 2026',
            start_date=date(2026, 3, 21),
            end_date=date(2026, 3, 31),
            target_bottles=50000,
            is_active=False,
        )
        Campaign.objects.create(
            name='Рамазан 2026 — Чистый Таджикистан',
            description='Акция Рамазан: сдай бутылку — получи +5 бонусных очков за переработку',
            start_date=date(2026, 3, 1),
            end_date=date(2026, 3, 29),
            target_bottles=30000,
            is_active=False,
        )
        Campaign.objects.create(
            name='Лето 2026 — Освежись и переработай',
            description='Летняя кампания: отслеживаем каждую бутылку',
            start_date=date(2026, 6, 1),
            end_date=date(2026, 8, 31),
            target_bottles=100000,
            is_active=True,
        )

        self.stdout.write(self.style.SUCCESS('✅ Seed complete!'))
        self.stdout.write(f"  Admin: phone=admin / password=Botlback2026!")
        self.stdout.write(f"  Demo user: phone=+992900000001 / OTP=1234")
        self.stdout.write(f"  Demo QRs: BTL-DEMO-0001, BTL-DEMO-0002, RP-DEMO-001")
        self.stdout.write(f"  Total scans: {Scan.objects.count()}")
        self.stdout.write(f"  Total bottles: {Bottle.objects.count()}")
        self.stdout.write(f"  Total users: {User.objects.count()}")

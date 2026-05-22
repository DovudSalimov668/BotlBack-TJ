import random
import string
from datetime import date, datetime, timedelta
from zoneinfo import ZoneInfo

from django.core.management.base import BaseCommand

TJ = ZoneInfo('Asia/Dushanbe')

TAJIK_FIRST_NAMES = [
    'Азиз', 'Дилшод', 'Рустам', 'Бехруз', 'Джамшед', 'Шахзод', 'Баходур', 'Фируз',
    'Хуршед', 'Камол', 'Зафар', 'Сироджиддин', 'Мухаммад', 'Алишер', 'Тимур',
    'Фарангиз', 'Манижа', 'Нилуфар', 'Ситора', 'Мадина', 'Гулнора', 'Нозима',
    'Нарима', 'Дилноза', 'Сабина', 'Зарина', 'Шахло', 'Наргис', 'Мунира', 'Лайло',
    'Бобур', 'Санжар', 'Ихтиёр', 'Умид', 'Жасур', 'Акбар', 'Суҳроб', 'Нодир',
    'Фарид', 'Элёр', 'Гулбаҳор', 'Барно', 'Муаззам', 'Хилола', 'Матлуба', 'Умида',
    'Шерзод', 'Жавлон', 'Нурали', 'Давлат', 'Хасан', 'Парвиз', 'Некруз', 'Вохид',
]
TAJIK_LAST_NAMES = [
    'Каримов', 'Рахимов', 'Саидов', 'Назаров', 'Миров', 'Холов', 'Турсунов',
    'Усмонов', 'Ахмедов', 'Юсупов', 'Баротов', 'Маматов', 'Эргашев', 'Султонов',
    'Хасанов', 'Каримова', 'Рахимова', 'Саидова', 'Назарова', 'Турсунова',
    'Ахмедова', 'Юсупова', 'Маматова', 'Эргашева', 'Султонова', 'Хасанова',
    'Рустамов', 'Ниёзов', 'Шарипов', 'Давлатов', 'Исмоилов', 'Раҳматов',
    'Бобоев', 'Ҳасанов', 'Муродов', 'Олимов', 'Соатов', 'Файзиев', 'Темиров',
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
    ('Coca-Cola 0.5L PET',       'coca-cola', 500,  'PET', '/products/coca-cola.svg'),
    ('Coca-Cola 1.5L PET',       'coca-cola', 1500, 'PET', '/products/coca-cola.svg'),
    ('Fanta Апельсин 0.5L PET',  'fanta',     500,  'PET', '/products/fanta.svg'),
    ('Sprite 1L PET',            'sprite',    1000, 'PET', '/products/sprite.svg'),
    ('Bonaqua 0.5L PET',         'bonaqua',   500,  'PET', '/products/bonaqua.svg'),
    ('Fuse Tea Лимон 0.5L PET',  'fanta',     500,  'PET', '/products/fuse-tea.svg'),
    ('Coca-Cola Zero 0.5L PET',  'coca-cola', 500,  'PET', '/products/coca-cola-zero.svg'),
]

PRIZES = [
    ('5 сом на Alif Mobi', '5 сомонӣ ба Alif Mobi', 50, 100),
    ('10 сом на Alif Mobi', '10 сомонӣ ба Alif Mobi', 90, 50),
    ('25 сом на Alif Mobi', '25 сомонӣ ба Alif Mobi', 200, 20),
    ('Бесплатная Bonaqua 0.5L', 'Bonaqua 0.5L ройгон', 30, 200),
    ('Сумка Coca-Cola', 'Сумкаи Coca-Cola', 150, 30),
    ('Футболка Coca-Cola', 'Куртаи Coca-Cola', 300, 15),
    ('Магнит Coca-Cola', 'Оҳанрабои Coca-Cola', 20, 500),
    ('Бесплатный Fuse Tea', 'Fuse Tea ройгон', 25, 100),
    ('Скидка 50% на Coca-Cola', '50% тахфиф', 75, 50),
    ('Рюкзак Coca-Cola', 'Рюкзак Coca-Cola', 500, 5),
]

REGION_WEIGHTS = {'dushanbe': 55, 'sughd': 22, 'khatlon': 13, 'gbao': 4, 'rrs': 6}
RECYCLING_RATES = {'dushanbe': 0.65, 'sughd': 0.42, 'khatlon': 0.32, 'gbao': 0.25, 'rrs': 0.22}

# Test accounts: phone → (name, region, target_points, tier_desc)
TEST_ACCOUNTS = [
    ('+992900000001', 'Комрон Рустамов',   'dushanbe', 'demo'),
    ('+992900000002', 'Лола Саидова',       'dushanbe', 'platinum'),   # 1200+ pts
    ('+992900000003', 'Бахром Каримов',     'sughd',    'gold'),        # 600+ pts
    ('+992900000004', 'Ситора Назарова',    'khatlon',  'silver'),      # 300+ pts
    ('+992900000005', 'Нодир Юсупов',       'gbao',     'bronze'),      # <200 pts
    ('+992900000006', 'Зарина Холова',      'rrs',      'bronze'),
    ('+992900000007', 'Алишер Турсунов',    'dushanbe', 'gold'),
    ('+992900000008', 'Манижа Ахмедова',    'sughd',    'silver'),
    ('+992900000009', 'Фируз Маматов',      'khatlon',  'bronze'),
    ('+992900000010', 'Шахзод Эргашев',     'dushanbe', 'platinum'),
]

TIER_SCAN_COUNTS = {
    'platinum': (80, 120, 0.85),   # (purchase_count, recycle_count_approx, recycle_rate)
    'gold':     (45, 55,  0.75),
    'silver':   (20, 25,  0.65),
    'bronze':   (8,  10,  0.40),
    'demo':     (30, 23,  0.77),
}


def gen_qr(prefix='BTL', length=8):
    chars = string.ascii_uppercase + string.digits
    return f"{prefix}-{''.join(random.choices(chars, k=4))}-{''.join(random.choices(chars, k=4))}"


def get_random_hour():
    # Peak hours: lunch (12-14) and evening/iftar (18-20)
    weights = [1, 1, 1, 1, 1, 2, 5, 10, 15, 18, 20, 22, 28, 25, 20, 16, 18, 22, 30, 28, 22, 15, 8, 3]
    return random.choices(range(24), weights=weights, k=1)[0]


def random_dt_in_range(start_date, end_date):
    delta = max((end_date - start_date).days, 1)
    day = start_date + timedelta(days=random.randint(0, delta))
    hour = get_random_hour()
    minute = random.randint(0, 59)
    return datetime(day.year, day.month, day.day, hour, minute, tzinfo=TJ)


class Command(BaseCommand):
    help = 'Seed rich demo data for BotlBack TJ hackathon presentation'

    def handle(self, *args, **options):
        from apps.users.models import User
        from apps.bottles.models import SKU, Bottle
        from apps.scans.models import Scan
        from apps.recycling.models import RecyclingPoint
        from apps.rewards.models import Prize, Redemption
        from apps.analytics.models import Campaign

        self.stdout.write('🧹  Clearing existing data...')
        Redemption.objects.all().delete()
        Scan.objects.all().delete()
        Bottle.objects.all().delete()
        RecyclingPoint.objects.all().delete()
        Prize.objects.all().delete()
        Campaign.objects.all().delete()
        SKU.objects.all().delete()
        User.objects.all().delete()

        # ── Admin ──
        self.stdout.write('👤  Creating admin...')
        admin = User.objects.create_user(phone='admin', name='Администратор')
        admin.set_password('Botlback2026!')
        admin.is_staff = True
        admin.is_superuser = True
        admin.save()

        # ── SKUs ──
        self.stdout.write('📦  Creating SKUs...')
        sku_objs = []
        for name, brand, vol, pkg, img in SKUS:
            sku_objs.append(SKU.objects.create(name=name, brand=brand, volume_ml=vol, package_type=pkg, image_url=img))

        # ── Recycling points ──
        self.stdout.write('📍  Creating recycling points...')
        for name, name_tg, addr, lat, lon, region, qr in RECYCLING_POINTS:
            RecyclingPoint.objects.get_or_create(
                qr_code=qr,
                defaults=dict(name=name, name_tg=name_tg, address=addr,
                              latitude=lat, longitude=lon, region=region)
            )
        rp_by_region = {r: list(RecyclingPoint.objects.filter(region=r)) for r in REGION_WEIGHTS}
        # Fallback: if region has no recycling points, use dushanbe
        for r in REGION_WEIGHTS:
            if not rp_by_region[r]:
                rp_by_region[r] = rp_by_region['dushanbe']

        # ── Prizes ──
        self.stdout.write('🎁  Creating prizes...')
        for name, name_tg, cost, stock in PRIZES:
            Prize.objects.create(name=name, name_tg=name_tg, points_cost=cost, stock_quantity=stock)

        # ── 500 random users ──
        self.stdout.write('👥  Creating 500 users...')
        regions = list(REGION_WEIGHTS.keys())
        region_weights = list(REGION_WEIGHTS.values())
        users = []
        used_phones = set()
        for i in range(500):
            first = random.choice(TAJIK_FIRST_NAMES)
            last  = random.choice(TAJIK_LAST_NAMES)
            region = random.choices(regions, weights=region_weights, k=1)[0]
            phone = f"+992{random.randint(700000002, 999999999)}"
            while phone in used_phones:
                phone = f"+992{random.randint(700000002, 999999999)}"
            used_phones.add(phone)
            user = User.objects.create_user(phone=phone, name=f"{first} {last}", region=region)
            users.append(user)

        # ── 5000 bottles ──
        self.stdout.write('🍾  Creating 5000 bottles...')
        magic_qrs = ['BTL-DEMO-0001', 'BTL-DEMO-0002', 'BTL-DEMO-0003', 'BTL-DEMO-0004', 'BTL-DEMO-0005']
        for mqr in magic_qrs:
            Bottle.objects.create(
                qr_code=mqr, sku=sku_objs[0],
                batch_number='DEMO-BATCH', produced_at=date(2026, 1, 1),
            )
        batch = []
        existing_qrs = set(magic_qrs)
        for _ in range(4995):
            sku = random.choice(sku_objs)
            qr = gen_qr()
            while qr in existing_qrs:
                qr = gen_qr()
            existing_qrs.add(qr)
            batch.append(Bottle(
                qr_code=qr, sku=sku,
                batch_number=f"BATCH-{random.randint(1000, 9999)}",
                produced_at=date(2026, random.randint(1, 5), random.randint(1, 28)),
            ))
        Bottle.objects.bulk_create(batch, batch_size=500)

        # ── ~8000 scans over 60 days ──
        self.stdout.write('📱  Creating ~8000 scans over 60 days...')
        end_date   = date.today()
        start_date = end_date - timedelta(days=60)

        all_regular = list(Bottle.objects.exclude(qr_code__in=magic_qrs).order_by('?'))
        # Reserve bottles for test accounts (10 accounts × max 120 = 1200 bottles)
        test_reserve = all_regular[:1200]
        pool = all_regular[1200:]
        random.shuffle(pool)

        scan_objs = []
        updated_bottles = []
        for bottle in pool:
            user = random.choice(users)
            region = user.region
            rps = rp_by_region[region]
            dt_purchase = random_dt_in_range(start_date, end_date)
            scan_objs.append(Scan(
                bottle=bottle, user=user, scan_type='purchase',
                region=region, points_awarded=10, created_at=dt_purchase,
            ))
            bottle.is_scanned = True

            if random.random() < RECYCLING_RATES.get(region, 0.3):
                rp = random.choice(rps)
                offset = random.randint(1, 14)
                dt_recycle = dt_purchase + timedelta(days=offset)
                end_dt = datetime(end_date.year, end_date.month, end_date.day, 23, 59, tzinfo=TJ)
                if dt_recycle > end_dt:
                    dt_recycle = random_dt_in_range(start_date, end_date)
                scan_objs.append(Scan(
                    bottle=bottle, user=random.choice(users), scan_type='recycle',
                    latitude=float(rp.latitude), longitude=float(rp.longitude),
                    region=region, points_awarded=20, created_at=dt_recycle,
                ))
                bottle.is_recycled = True
            updated_bottles.append(bottle)

        Scan.objects.bulk_create(scan_objs, ignore_conflicts=True, batch_size=500)
        Bottle.objects.bulk_update(updated_bottles, ['is_scanned', 'is_recycled'], batch_size=500)

        # ── Test accounts ──
        self.stdout.write('🧪  Creating 10 test accounts...')
        test_reserve_bottles = list(test_reserve)
        idx = 0
        prize_obj = Prize.objects.first()
        test_users = []

        for phone, name, region, tier in TEST_ACCOUNTS:
            user, _ = User.objects.get_or_create(
                phone=phone,
                defaults={'name': name, 'region': region}
            )
            test_users.append(user)
            purchases, recycles_approx, recycle_rate = TIER_SCAN_COUNTS.get(tier, (10, 5, 0.5))
            day_base = end_date - timedelta(days=random.randint(10, 55))

            user_scan_objs = []
            recycled_count = 0
            rps = rp_by_region[region]

            for j in range(purchases):
                if idx >= len(test_reserve_bottles):
                    break
                b = test_reserve_bottles[idx]
                idx += 1
                b.is_scanned = True
                _d = datetime(day_base.year, day_base.month, day_base.day, tzinfo=TJ) + timedelta(days=j * random.randint(1, 3), hours=random.randint(8, 21))
                dt_p = _d
                if dt_p > datetime(end_date.year, end_date.month, end_date.day, 23, 59, tzinfo=TJ):
                    dt_p = random_dt_in_range(start_date, end_date)
                user_scan_objs.append(Scan(
                    bottle=b, user=user, scan_type='purchase',
                    region=region, points_awarded=10, created_at=dt_p,
                ))
                if random.random() < recycle_rate and recycled_count < recycles_approx:
                    rp = random.choice(rps)
                    dt_r = dt_p + timedelta(days=random.randint(1, 7))
                    if dt_r > datetime(end_date.year, end_date.month, end_date.day, 23, 59, tzinfo=TJ):
                        dt_r = dt_p + timedelta(hours=random.randint(4, 48))
                    user_scan_objs.append(Scan(
                        bottle=b, user=user, scan_type='recycle',
                        latitude=float(rp.latitude), longitude=float(rp.longitude),
                        region=region, points_awarded=20, created_at=dt_r,
                    ))
                    b.is_recycled = True
                    recycled_count += 1

            Scan.objects.bulk_create(user_scan_objs, ignore_conflicts=True)
            Bottle.objects.bulk_update(
                [b for b in test_reserve_bottles[idx - purchases:idx]],
                ['is_scanned', 'is_recycled'], batch_size=200
            )
            # Set streak
            user.streak_days = random.randint(1, 7) if purchases > 5 else 1
            user.last_scan_date = end_date - timedelta(days=random.randint(0, 2))
            user.save(update_fields=['streak_days', 'last_scan_date'])

            # Redemption for higher-tier users
            if tier in ('platinum', 'gold') and prize_obj:
                Redemption.objects.create(
                    user=user, prize=prize_obj,
                    points_spent=prize_obj.points_cost, status='fulfilled'
                )

        # ── Campaigns ──
        self.stdout.write('📅  Creating campaigns...')
        Campaign.objects.create(
            name='Навруз 2026 — Переработай!',
            description='Специальная акция Навруз: +2x очки за переработку с 21 по 31 марта 2026',
            start_date=date(2026, 3, 21), end_date=date(2026, 3, 31),
            target_bottles=50000, is_active=False,
        )
        Campaign.objects.create(
            name='Рамазан 2026 — Чистый Таджикистан',
            description='Акция Рамазан: сдай бутылку — получи +5 бонусных очков за переработку',
            start_date=date(2026, 3, 1), end_date=date(2026, 3, 29),
            target_bottles=30000, is_active=False,
        )
        Campaign.objects.create(
            name='Лето 2026 — Освежись и переработай',
            description='Летняя кампания: отслеживаем каждую бутылку Tajikistan',
            start_date=date(2026, 6, 1), end_date=date(2026, 8, 31),
            target_bottles=100000, is_active=True,
        )
        Campaign.objects.create(
            name='День Земли 2026',
            description='Сдай 3 бутылки за день и получи х3 очки',
            start_date=date(2026, 4, 22), end_date=date(2026, 4, 22),
            target_bottles=5000, is_active=False,
        )

        self.stdout.write(self.style.SUCCESS('\n✅  Seed complete!'))
        self.stdout.write('=' * 55)
        self.stdout.write('  ADMIN LOGIN')
        self.stdout.write('    phone=admin  password=Botlback2026!')
        self.stdout.write('')
        self.stdout.write('  TEST ACCOUNTS  (OTP = 1234 for all)')
        for phone, name, region, tier in TEST_ACCOUNTS:
            u = User.objects.get(phone=phone)
            self.stdout.write(f'    {phone}  {name:<22} {tier:<10} {u.total_points} pts')
        self.stdout.write('')
        self.stdout.write('  DEMO QR CODES')
        self.stdout.write('    BTL-DEMO-0001 … BTL-DEMO-0005 (purchase)')
        self.stdout.write('    RP-DEMO-001                   (recycle point)')
        self.stdout.write('=' * 55)
        self.stdout.write(f'  Users:    {User.objects.count()}')
        self.stdout.write(f'  Bottles:  {Bottle.objects.count()}')
        self.stdout.write(f'  Scans:    {Scan.objects.count()}')
        self.stdout.write(f'  Rec.pts:  {RecyclingPoint.objects.count()}')

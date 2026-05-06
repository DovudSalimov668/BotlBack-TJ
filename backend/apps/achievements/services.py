"""Helper to check + unlock achievements after a scan event."""
from .models import Achievement, UserAchievement


# Bootstrap catalog (idempotent — created via management/seed)
ACHIEVEMENT_DEFS = [
    # First steps
    dict(code='first_scan',     name='Первый шаг',       description='Отсканируй свою первую бутылку', emoji='🌱', threshold=1,    kind='purchase'),
    dict(code='first_recycle',  name='Эко-герой',        description='Сдай первую бутылку на переработку', emoji='♻️', threshold=1, kind='recycle'),
    # Recycle milestones
    dict(code='recycle_10',     name='Чемпион',          description='10 переработанных бутылок',    emoji='🥉', threshold=10,   kind='recycle'),
    dict(code='recycle_50',     name='Защитник природы',  description='50 переработанных бутылок',    emoji='🥈', threshold=50,   kind='recycle'),
    dict(code='recycle_100',    name='Легенда',          description='100 переработанных бутылок',   emoji='🥇', threshold=100,  kind='recycle'),
    # Points milestones
    dict(code='points_500',     name='Полтыщи',          description='500 баллов накоплено',          emoji='💎', threshold=500,  kind='points'),
    dict(code='points_1000',    name='Тысячник',         description='1000 баллов накоплено',         emoji='💠', threshold=1000, kind='points'),
    # Streaks
    dict(code='streak_3',       name='3 дня подряд',     description='Сканируй 3 дня подряд',         emoji='🔥', threshold=3,    kind='streak'),
    dict(code='streak_7',       name='Неделя огня',      description='Сканируй 7 дней подряд',        emoji='🚀', threshold=7,    kind='streak'),
    # CO2
    dict(code='co2_5',          name='5 кг CO₂',         description='Сэкономь 5 кг CO₂',             emoji='🌍', threshold=5,    kind='co2'),
]


def ensure_catalog():
    """Idempotently create achievement rows from ACHIEVEMENT_DEFS."""
    for d in ACHIEVEMENT_DEFS:
        Achievement.objects.update_or_create(code=d['code'], defaults=d)


def check_and_unlock(user) -> list[Achievement]:
    """Return list of newly unlocked achievements for the user."""
    ensure_catalog()
    unlocked_codes = set(UserAchievement.objects.filter(user=user).values_list('achievement__code', flat=True))
    purchased = user.scans.filter(scan_type='purchase').count()
    recycled = user.bottles_recycled
    pts = user.total_points
    co2 = user.co2_saved_kg
    streak = getattr(user, 'streak_days', 0)

    newly = []
    for a in Achievement.objects.all():
        if a.code in unlocked_codes:
            continue
        ok = False
        if a.kind == 'purchase':
            ok = purchased >= a.threshold
        elif a.kind == 'recycle':
            ok = recycled >= a.threshold
        elif a.kind == 'points':
            ok = pts >= a.threshold
        elif a.kind == 'co2':
            ok = co2 >= a.threshold
        elif a.kind == 'streak':
            ok = streak >= a.threshold
        if ok:
            UserAchievement.objects.create(user=user, achievement=a)
            newly.append(a)
    return newly

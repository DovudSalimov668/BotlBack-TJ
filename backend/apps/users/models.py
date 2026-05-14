from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models


class UserManager(BaseUserManager):
    def create_user(self, phone, password=None, **extra_fields):
        if not phone:
            raise ValueError('Phone is required')
        user = self.model(phone=phone, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, phone, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        return self.create_user(phone, password, **extra_fields)


class User(AbstractUser):
    REGION_CHOICES = [
        ('dushanbe', 'Душанбе'),
        ('sughd', 'Согд'),
        ('khatlon', 'Хатлон'),
        ('gbao', 'ГБАО'),
        ('rrs', 'РРС'),
    ]
    LANGUAGE_CHOICES = [('tg', 'Тоҷикӣ'), ('ru', 'Русский')]
    ROLE_CHOICES = [('consumer', 'Consumer'), ('brand_manager', 'Brand Manager')]

    username = None
    phone = models.CharField(max_length=20, unique=True)
    name = models.CharField(max_length=150, blank=True)
    language = models.CharField(max_length=2, choices=LANGUAGE_CHOICES, default='ru')
    region = models.CharField(max_length=20, choices=REGION_CHOICES, default='dushanbe')
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='consumer')
    streak_days = models.PositiveIntegerField(default=0)
    last_scan_date = models.DateField(null=True, blank=True)
    referral_code = models.CharField(max_length=8, unique=True, null=True, blank=True, db_index=True)
    referred_by = models.ForeignKey(
        'self', null=True, blank=True, on_delete=models.SET_NULL, related_name='referrals'
    )
    created_at = models.DateTimeField(auto_now_add=True)

    USERNAME_FIELD = 'phone'
    REQUIRED_FIELDS = []

    objects = UserManager()

    class Meta:
        verbose_name = 'Пользователь'
        verbose_name_plural = 'Пользователи'

    def __str__(self):
        return f"{self.name or self.phone}"

    @property
    def total_points(self):
        earned = self.scans.aggregate(total=models.Sum('points_awarded'))['total'] or 0
        spent = self.redemptions.aggregate(total=models.Sum('points_spent'))['total'] or 0
        return max(0, earned - spent)

    @property
    def bottles_recycled(self):
        return self.scans.filter(scan_type='recycle').count()

    @property
    def co2_saved_kg(self):
        return round(self.bottles_recycled * 0.082, 3)

    def bump_streak(self):
        from datetime import date, timedelta
        today = date.today()
        if self.last_scan_date == today:
            return  # already scanned today
        if self.last_scan_date == today - timedelta(days=1):
            self.streak_days = (self.streak_days or 0) + 1
        else:
            self.streak_days = 1
        self.last_scan_date = today
        self.save(update_fields=['streak_days', 'last_scan_date'])

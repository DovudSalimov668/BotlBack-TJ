from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Achievement, UserAchievement
from .serializers import AchievementSerializer
from .services import ensure_catalog, check_and_unlock


class MyAchievementsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        ensure_catalog()
        # Also re-evaluate on view to backfill any missed unlocks
        check_and_unlock(request.user)
        unlocked_ids = set(UserAchievement.objects.filter(user=request.user).values_list('achievement_id', flat=True))
        all_a = Achievement.objects.all().order_by('threshold')
        data = []
        for a in all_a:
            data.append({
                **AchievementSerializer(a).data,
                'unlocked': a.id in unlocked_ids,
            })
        return Response({
            'total': all_a.count(),
            'unlocked': len(unlocked_ids),
            'achievements': data,
        })

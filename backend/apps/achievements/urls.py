from django.urls import path
from .views import MyAchievementsView

urlpatterns = [
    path('me/', MyAchievementsView.as_view()),
]

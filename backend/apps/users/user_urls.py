from django.urls import path
from . import views

urlpatterns = [
    path('me/stats/', views.UserStatsView.as_view()),
    path('me/scans/', views.MyScanHistoryView.as_view()),
    path('me/referral/', views.MyReferralView.as_view()),
    path('me/challenges/', views.WeeklyChallengesView.as_view()),
    path('leaderboard/', views.LeaderboardView.as_view()),
    # Admin management
    path('admin/users/', views.AdminUserListView.as_view()),
    path('admin/users/<int:pk>/', views.AdminUserDetailView.as_view()),
]

from django.urls import path
from . import views

urlpatterns = [
    path('prizes/', views.PrizeListView.as_view()),
    path('redeem/', views.RedeemView.as_view()),
    path('history/', views.RedemptionHistoryView.as_view()),
    # Admin management
    path('admin/prizes/', views.AdminPrizeListCreateView.as_view()),
    path('admin/prizes/<int:pk>/', views.AdminPrizeDetailView.as_view()),
    path('admin/redemptions/', views.AdminRedemptionListView.as_view()),
    path('admin/redemptions/<int:pk>/', views.AdminRedemptionDetailView.as_view()),
]

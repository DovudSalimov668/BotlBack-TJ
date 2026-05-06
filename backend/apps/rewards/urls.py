from django.urls import path
from . import views

urlpatterns = [
    path('prizes/', views.PrizeListView.as_view()),
    path('redeem/', views.RedeemView.as_view()),
    path('history/', views.RedemptionHistoryView.as_view()),
]

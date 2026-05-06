from django.urls import path
from . import views

urlpatterns = [
    path('verify/<str:qr_code>/', views.VerifyBottleView.as_view()),
    path('scan/', views.ScanBottleView.as_view()),
    path('recycle/', views.RecycleBottleView.as_view()),
]

from django.urls import path
from . import views

urlpatterns = [
    path('points/', views.RecyclingPointListView.as_view()),
    path('points/<int:pk>/', views.RecyclingPointDetailView.as_view()),
]

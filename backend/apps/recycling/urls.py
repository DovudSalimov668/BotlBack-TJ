from django.urls import path
from . import views

urlpatterns = [
    path('points/', views.RecyclingPointListView.as_view()),
    path('points/<int:pk>/', views.RecyclingPointDetailView.as_view()),
    # Admin management
    path('admin/outlets/', views.AdminOutletListCreateView.as_view()),
    path('admin/outlets/<int:pk>/', views.AdminOutletDetailView.as_view()),
]

from django.urls import path
from . import views

urlpatterns = [
    path('overview/', views.OverviewView.as_view()),
    path('timeseries/', views.TimeSeriesView.as_view()),
    path('map/', views.MapView.as_view()),
    path('regions/', views.RegionsView.as_view()),
    path('skus/', views.SKUsView.as_view()),
    path('campaigns/', views.CampaignsView.as_view()),
]

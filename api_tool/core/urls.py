from django.contrib import admin
from django.urls import path
from core import views
from rest_framework.urlpatterns import format_suffix_patterns


urlpatterns = [
    path("send/", views.SendRequest.as_view()),
    path("history/", views.RequestHistory.as_view()),
]
urlpatterns = format_suffix_patterns(urlpatterns)
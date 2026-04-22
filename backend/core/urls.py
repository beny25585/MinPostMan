from django.urls import path
from core import views

urlpatterns = [
    path("send/", views.SendRequest.as_view()),
    path("history/", views.RequestHistory.as_view()),
    path("collections/", views.CollectionList.as_view()),
    path("collections/<int:pk>/", views.CollectionDetail.as_view()),
    path("saved-requests/", views.SavedRequestList.as_view()),
    path("saved-requests/<int:pk>/", views.SavedRequestDetail.as_view()),
    path("auth/register/", views.RegisterView.as_view()),
    path("auth/login/", views.LoginView.as_view()),
    path("auth/logout/", views.LogoutView.as_view()),
]

from django.urls import path
from . import views

urlpatterns = [
    path('', views.chatbot_view, name='chatbot'),
    path('bot-reply/', views.get_bot_reply, name='get_bot_reply'),
]

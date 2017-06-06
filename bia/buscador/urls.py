from django.conf.urls import url
from . import views

urlpatterns = [
    url(r'^$', views.home, name='home'),
    url(r'signin$', views.login_method, name='login'),
    url(r'signup$', views.register, name='register'),
    url(r'kolbform$', views.kolb_form, name='kolb'),
]

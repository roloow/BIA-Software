from django.conf.urls import url
from . import views

urlpatterns = [
    url(r'^$', views.home, name='home'),
    url(r'signin$', views.login_method, name='login'),
    url(r'signup$', views.register, name='register'),
    url(r'logout$', views.logout_method, name='logout'),
    url(r'kolbform$', views.kolb_form, name='kolb'),
    url(r'building$', views.building, name='building'),
    url(r'user/(?P<client_id>\d+)/profile$', views.user_profile, name='profile'),
    url(r'search$', views.search_home, name='search'),
    url(r'ann$', views.ann, name='ann'),
    url(r'ann/activate$', views.activate_ann, name='activate'),
    url(r'ann/deactivate$', views.deactivate_ann, name='deactivate'),
    url(r'ann/train$', views.train_ann, name='train'),
    url(r'search/view/(?P<data_id>\d+)$', views.fileview, name='view'),
]

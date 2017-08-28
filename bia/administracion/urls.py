from django.conf.urls import url
from . import views

urlpatterns = [
    url(r'file/upload$', views.upload_data, name='upload'),
    url(r'file/receiver$', views.upload_receiver, name='receiver'),
    url(r'file/success$', views.upload_success, name='success'),
    url(r'manage/tag$', views.manager_tag, name='tags'),
    url(r'manage/type$', views.manager_type, name='types'),
    url(r'manage/external$', views.external, name='external'),
    url(r'manage/external/get$', views.external_get, name='external_get'),
]

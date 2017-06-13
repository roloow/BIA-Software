# -*- coding: utf-8 -*-

from django.db import models

def data_file_handler(instance, filename):
    data_id = len(DataModel.objects.all()) + 1
    ext = filename.split('.')[-1]
    return "data_{data_id}.{ext}".format(data_id=data_id, ext=ext)

class DataModel(models.Model):
    file_path = models.FileField(upload_to=data_file_handler, blank=True, null=True)
    nombre = models.CharField(max_length=100)
    descripcion = models.CharField(max_length=300, null=True, blank=True)
    tags = models.ManyToManyField('TagModel', through='DataTagModel',
                                    through_fields=('data', 'tag'),
                                    related_name='tag_files')
    types = models.ForeignKey('TypeModel', related_name='datas', null=True, blank=True)

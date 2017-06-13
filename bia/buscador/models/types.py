# -*- coding: utf-8 -*-

from django.db import models

def type_image_handler(instance, filename):
    data_id = len(TypeModel.objects.all()) + 1
    ext = filename.split('.')[-1]
    return "type/image_{data_id}.{ext}".format(data_id=data_id, ext=ext)

class TypeModel(models.Model):
    nombre = models.CharField(max_length=20)
    image = models.ImageField(upload_to=type_image_handler, blank=True,
                              null=True)

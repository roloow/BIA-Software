# -*- coding: utf-8 -*-

from django.db import models

class KolbTagModel(models.Model):
    kolb = models.ForeignKey('KolbModel', on_delete=models.CASCADE, related_name='kolb_profiles')
    tag = models.ForeignKey('TagModel', on_delete=models.CASCADE, related_name='tags')
    date_created = models.DateTimeField(auto_now_add=True)
    date_modified = models.DateTimeField(auto_now=True)

class DataTagModel(models.Model):
    data = models.ForeignKey('DataModel', on_delete=models.CASCADE, related_name='tag_files')
    tag = models.ForeignKey('TagModel', on_delete=models.CASCADE, related_name='file_tags')
    date_created = models.DateTimeField(auto_now_add=True)
    date_modified = models.DateTimeField(auto_now=True)

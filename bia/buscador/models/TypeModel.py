# -*- coding: utf-8 -*-

from django.db import models

class TypeModel(models.Model):
    nombre = models.CharField(max_length=20)
    

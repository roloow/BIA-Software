# -*- coding: utf-8 -*-

from django.db import models

class ANN(models.Model):
    l_rate = models.IntegerField(null=True, blank=True, default=0)
    files = models.IntegerField(null=True,blank=True, default=0)
    active = models.BooleanField(default=False, help_text="Activación de la red Neuronal")

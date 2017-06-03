# -*- coding: utf-8 -*-

from django.db import models

class TagModel(models.Model):
    HIGH_IMPORTANCE = 0
    MEDIUM_IMPORTANCE = 1
    LOW_IMPORTANCE = 2
    IMPORTANCES_CHOICES = (
        (HIGH_IMPORTANCE, 'high'),
        (MEDIUM_IMPORTANCE, 'medium'),
        (LOW_IMPORTANCE, 'low'),
    )

    relevancia = models.SmallIntegerField(choices=IMPORTANCES_CHOICES, default=MEDIUM_IMPORTANCE)
    nombre = models.CharField(max_length=20)

    def __unicode__(self):
        return self.nombre

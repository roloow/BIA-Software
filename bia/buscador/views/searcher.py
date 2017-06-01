# -*- coding: utf-8 -*-
from .common import get_base_context
from django.shortcuts import render


def home(request):
    """
    Muestra la página de inicio
    """
    context = get_base_context(request)
    return render(request, 'buscador/home.html', context)
# -*- coding: utf-8 -*-
from .common import get_base_context
from django.shortcuts import render
from django.contrib.auth.decorators import login_required


def home(request):
    """
    Muestra la página de inicio
    """
    context = get_base_context(request)
    return render(request, 'buscador/home.html', context)

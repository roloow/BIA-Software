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

def building(request):
    context = get_base_context(request)
    return render(request, 'buscador/building.html', context)

def search_home(request):
    context= get_base_context(request)
    if request.method == "GET":
        return render(request, 'buscador/search.html', context)
    if request.method == "POST":
        # TODO: Busqueda y filtro
        context['results'] = True
        return render(request, 'buscador/search.html', context)

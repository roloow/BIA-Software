# -*- coding: utf-8 -*-
from .common import get_base_context
from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from buscador.models import DataModel

@login_required
def home(request):
    """
    Muestra la página de inicio
    """
    context = get_base_context(request)
    return render(request, 'buscador/home.html', context)

@login_required
def building(request):
    context = get_base_context(request)
    return render(request, 'buscador/building.html', context)

@login_required
def search_home(request):
    context= get_base_context(request)
    if request.method == "GET":
        return render(request, 'buscador/search.html', context)
    if request.method == "POST":
        results = DataModel.objects.filter(nombre__icontains=request.POST['filtro'])
        context['results'] = results
        return render(request, 'buscador/search.html', context)

# -*- coding: utf-8 -*-
from .common import get_base_context
from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from buscador.models import DataModel, ANN, TypeModel, DataTagModel

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
        if request.user.profile.kolb_profile:
            return render(request, 'buscador/search.html', context)
        else:
            return redirect('buscador:home')
    if request.method == "POST":
        results = []
        if 'radio1' in request.POST.keys():
            val =  int(request.POST['radio1'])
            if val == 0:
                results = DataModel.objects.filter(types__nombre__icontains=request.POST['filtro'])
            elif val == 1:
                results_tags = DataTagModel.objects.filter(tag__nombre__icontains=request.POST['filtro'])
                for i in range(len(results_tags)):
                    datatag = results_tags[i]
                    print datatag.data
                    results.append(datatag.data)
            else:
                results = DataModel.objects.filter(nombre__icontains=request.POST['filtro'])
        else:
            results = DataModel.objects.filter(nombre__icontains=request.POST['filtro'])
        context['results'] = results
        if len(results) == 0:
            context['notfound'] = True
        if len(results) > 0:
            context['notfound'] = False
        return render(request, 'buscador/search.html', context)

@login_required
def ann(request):
    context = get_base_context(request)
    if request.method == "GET":
        data_amount = 0
        l_rate = 0
        status = False
        redes = ANN.objects.all()
        if redes:
            red = redes[0]
            l_rate = red.l_rate
            data_amount = red.files
            status = red.active
        context['l_rate'] = l_rate
        context['data_amount'] = data_amount
        context['status'] = status
        return render(request, 'buscador/ann.html', context)

@login_required
def fileview(request, data_id):
    context = get_base_context(request)
    data = DataModel.objects.get(pk=data_id)
    context['data'] = data
    return render(request, 'buscador/fileview.html', context)

@login_required
def activate_ann(request):
    anns = ANN.objects.all()
    if len(anns) > 0:
        ann = anns[0]
    else:
        ann = ANN()
    ann.active = True
    ann.save()
    return redirect("buscador:ann")


@login_required
def deactivate_ann(request):
    anns = ANN.objects.all()
    if len(anns) > 0:
        ann = anns[0]
    else:
        ann = ANN()
    ann.active = False
    ann.save()
    return redirect("buscador:ann")

@login_required
def train_ann(request):
    files = len(DataModel.objects.all())
    anns = ANN.objects.all()
    if len(anns) > 0:
        ann = anns[0]
    else:
        ann = ANN()
    ann.files = files
    if files < 10:
        ann.l_rate = 1
    elif files < 50:
        ann.l_rate = 3
    elif files < 100:
        ann.l_rate = 8
    elif files < 500:
        ann.l_rate = 13
    elif files < 800:
        ann.l_rate = 20
    elif files < 1000:
        ann.l_rate = 23
    ann.save()
    return redirect("buscador:ann")

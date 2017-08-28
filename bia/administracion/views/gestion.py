# -*- coding: utf-8 -*-
from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import User
from buscador.models import DataModel, TagModel, TypeModel, KolbModel, KolbTagModel, DataTagModel
from administracion.forms import DocumentForm, TypeImageForm
import urllib

def get_base_context(request, *args, **kwargs):
    base_context = {
    }
    return base_context

@login_required
def upload_data(request):
    context = get_base_context(request)
    types = TypeModel.objects.all()
    tags = TagModel.objects.all()
    context['types'] = types
    context['tags'] = tags
    return render(request, 'administracion/upload.html', context)

@login_required
def upload_receiver(request):
    context = get_base_context(request)
    if request.method == "GET":
        return redirect('buscador:home')
    if request.method == "POST":
        if request.FILES['fullname']:
            form = DocumentForm(request.POST, request.FILES)
            print request.POST
            print request.POST['my_multi_select1[]'][0],request.POST['my_multi_select1[]'][1]
            print request.POST
            if form.is_valid():
                tags = None
                typed = None
                if 'my_multi_select1[]' in request.POST.keys():
                    tags = map(int,request.POST['my_multi_select1[]'])
                    print tags
                    print  request.POST['my_multi_select1[]']
                if 'a1' in request.POST.keys():
                    typed = int(request.POST['a1'])
                instance = DataModel(file_path=request.FILES['fullname'], nombre=request.POST['username'], descripcion=request.POST['descripcion'])
                if typed:
                    tp = TypeModel.objects.get(pk=typed)
                    instance.types = tp
                instance.save()
                if tags:
                    for tagd in tags:
                        tg = TagModel.objects.get(pk=tagd)
                        new = DataTagModel()
                        new.tag = tg
                        new.data = instance
                        new.save()
                return redirect('administracion:success')
        context['error'] = True
        types = TypeModel.objects.all()
        tags = TagModel.objects.all()
        context['types'] = types
        context['tags'] = tags
        return render(request, 'administracion/upload.html', context)

@login_required
def upload_success(request):
    context = get_base_context(request)
    if request.method == "GET":
        return render(request, 'administracion/upload_success.html', context)
    return redirect('buscador:home')

@login_required
def manager_tag(request):
    context = get_base_context(request)
    tags = TagModel.objects.all()
    context['tags'] = tags
    if request.method == "POST":
        name = request.POST['name']
        try:
            checkboxes = request.POST['checkboxes1[]']
            checkboxes = map(int,checkboxes)
        except:
            context["error"] = True
            return render(request, 'administracion/crud_tags.html', context)
        if name:
            if len(name) > 0:
                if len(checkboxes) > 0:
                    tag = TagModel(nombre=name)
                    if 'radio1' in request.POST:
                        relevance = int(request.POST['radio1'])
                        if TagModel.HIGH_IMPORTANCE == relevance:
                            tag.relevancia = TagModel.HIGH_IMPORTANCE
                        if TagModel.MEDIUM_IMPORTANCE == relevance:
                            tag.relevancia = TagModel.MEDIUM_IMPORTANCE
                        if TagModel.LOW_IMPORTANCE == relevance:
                            tag.relevancia = TagModel.LOW_IMPORTANCE
                    tag.save()
                    if KolbModel.ASIMILADOR in checkboxes:
                        asimilador = KolbModel.objects.get(nombre="Asimilador")
                        middle = KolbTagModel(kolb=asimilador,tag=tag)
                        middle.save()
                    if KolbModel.DIVERGENTE in checkboxes:
                        divergente = KolbModel.objects.get(nombre="Divergente")
                        middle = KolbTagModel(kolb=divergente,tag=tag)
                        middle.save()
                    if KolbModel.ACOMODADOR in checkboxes:
                        acomodador = KolbModel.objects.get(nombre="Acomodador")
                        middle = KolbTagModel(kolb=acomodador,tag=tag)
                        middle.save()
                    if KolbModel.CONVERGENTE in checkboxes:
                        convergente = KolbModel.objects.get(nombre="Convergente")
                        middle = KolbTagModel(kolb=convergente,tag=tag)
                        middle.save()
                    return render(request, 'administracion/crud_tags.html', context)
        context["error"] = True
        return render(request, 'administracion/crud_tags.html', context)


    return render(request, 'administracion/crud_tags.html', context)

@login_required
def manager_type(request):
    context = get_base_context(request)
    types = TypeModel.objects.all()
    context['types'] = types
    if request.method == "POST":
        if len(request.POST['nombre']) > 0:
            form = TypeImageForm(request.POST, request.FILES)
            print request.FILES
            if form.is_valid():
                form.save()

            return render(request, 'administracion/crud_types.html', context)
        context['error'] = True
    return render(request, 'administracion/crud_types.html', context)

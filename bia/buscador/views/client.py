# -*- coding: utf-8 -*-
from .common import get_base_context
from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from django.contrib.auth import authenticate, login, logout
from buscador.models import ClientModel, KolbModel
from django.contrib.auth.models import User
import urllib

# Login
def login_method(request):
    context = get_base_context(request)
    if request.method == "GET":
        if request.user.is_authenticated:
            return render(request, 'buscador/home.html', context)
        return render(request, 'buscador/user_login.html', context)
    if request.method == "POST":
        user = authenticate(request, username=request.POST['username'], password=request.POST['password'])
        if user:
            login(request, user)
            return render(request, 'buscador/home.html', context)
        context['error'] = True
        return render(request, 'buscador/user_login.html', context)

# logout
def logout_method(request):
    logout(request)
    return redirect('buscador:home')


# Register
def register(request):
    context = get_base_context(request)
    if request.method == "GET":
        if request.user.is_authenticated:
            return render(request, 'buscador/home.html', context)
        return render(request, 'buscador/user_login.html', context)
    if request.method == "POST":
        if ClientModel.objects.filter(auth_user__email=request.POST['email']):
            context['error_registro'] = True
            return render(request, 'buscador/user_login.html', context)
        user = User.objects.create_user(request.POST['email'],request.POST['email'],request.POST['password'])
        user.first_name = request.POST['firstname']
        user.last_name = request.POST['lastname']
        user.save()
        client = ClientModel()
        client.auth_user = user
        client.save()
        login(request, user)
        response = redirect('buscador:kolb')
        response['Location'] += '?' + urilib.urlencode({'client_id'})
        return response

# Kolb Form
@login_required
def kolb_form(request):
    context = get_base_context(request)
    client_id = request.GET.get("client_id", False)
    context['client_id'] = client_id
    if request.user.profile.pk != int(client_id):
        # TODO: PAGE 404 - User cannot do someone elses KolbForm
        return render(request, 'buscador/home.html', context)
    if request.method == 'GET':
        return render(request, 'buscador/kolb_form.html', context)
    if request.method == 'POST':
        # TODO: Mejorar comportamiento
        if 'q1' not in request.POST.keys():
            context['error'] = True
            return render(request, 'buscador/kolb_form.html', context)
        kolb_profile = request.POST['q1']
        # TODO: Analizador de respuestas
        kp = KolbModel.objects.get(nombre=kolb_profile)
        client = ClientModel.objects.get(pk=client_id)
        client.kolb_profile = kp
        client.save()
        return render(request, 'buscador/home.html', context)

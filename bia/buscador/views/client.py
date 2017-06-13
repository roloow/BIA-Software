# -*- coding: utf-8 -*-
from .common import get_base_context, get_resp_preg, calificar_kolb
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
        response['Location'] += '?' + urllib.urlencode({'client_id'})
        return response

# Kolb Form
@login_required
def kolb_form(request):
    context = get_base_context(request)
    client_id = request.GET.get("client_id", False)
    context['client_id'] = client_id
    porc = [0,0,0,0]
    if request.user.profile.pk != int(client_id):
        # TODO: PAGE 404 - User cannot do someone elses KolbForm
        return render(request, 'buscador/home.html', context)
    if request.method == 'GET':
        return render(request, 'buscador/kolb_form.html', context)
    if request.method == 'POST':
        if request.POST['p1'] == 'p1':
            porc = map(sum, zip(porc, get_resp_preg('1', request, context)))
        if request.POST['p2'] == 'p2':
            porc = map(sum, zip(porc, get_resp_preg('2', request, context)))
        if request.POST['p3'] == 'p3':
            porc = map(sum, zip(porc, get_resp_preg('3', request, context)))
        if request.POST['p4'] == 'p4':
            porc = map(sum, zip(porc, get_resp_preg('4', request, context)))
        if request.POST['p5'] == 'p5':
            porc = map(sum, zip(porc, get_resp_preg('5', request, context)))
        if request.POST['p6'] == 'p6':
            porc = map(sum, zip(porc, get_resp_preg('6', request, context)))
        if request.POST['p7'] == 'p7':
            porc = map(sum, zip(porc, get_resp_preg('7', request, context)))
        if request.POST['p8'] == 'p8':
            porc = map(sum, zip(porc, get_resp_preg('8', request, context)))
        if request.POST['p9'] == 'p9':
            porc = map(sum, zip(porc, get_resp_preg('9', request, context)))
        if request.POST['p10'] == 'p10':
            porc = map(sum, zip(porc, get_resp_preg('10', request, context)))
        if request.POST['p11'] == 'p11':
            porc = map(sum, zip(porc, get_resp_preg('11', request, context)))
        if request.POST['p12'] == 'p12':
            porc = map(sum, zip(porc, get_resp_preg('12', request, context)))
        # TODO: Analizador de respuestas
        kp = KolbModel.objects.get(nombre=calificar_kolb(porc))
        client = ClientModel.objects.get(pk=client_id)
        client.kolb_profile = kp
        client.save()
        return render(request, 'buscador/home.html', context)
    return render(request, 'buscador/home.html', context)

@login_required
def user_profile(request, client_id):
    context = get_base_context(request)
    context['my_profile'] = False
    if request.user.profile.pk == int(client_id):
        context['my_profile'] = True
    client = ClientModel.objects.get(pk=client_id)
    context['client'] = client
    return render(request, 'buscador/user_profile.html', context)

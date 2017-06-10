# -*- coding: utf-8 -*-
from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import User
import urllib

def get_base_context(request, *args, **kwargs):
    base_context = {
    }
    return base_context

def upload_data(request):
    context = get_base_context(request)
    return render(request, 'administracion/upload.html', context)

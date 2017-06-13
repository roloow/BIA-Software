# -*- coding: utf-8 -*-
from django.shortcuts import render, redirect

def get_base_context(request, *args, **kwargs):
    base_context = {
    }
    return base_context

def get_resp_preg(num_preg, request, context):
  Q = 'Q' + num_preg
  q1 = Q + '1'
  q2 = Q + '2'
  q3 = Q + '3'
  q4 = Q + '4'
  # TODO: Mejorar comportamiento
  if q1 not in request.POST.keys():
    context['error'] = True
    return render(request, 'buscador/kolb_form.html', context)
  if q2 not in request.POST.keys():
    context['error'] = True
    return render(request, 'buscador/kolb_form.html', context)
  if q3 not in request.POST.keys():
    context['error'] = True
    return render(request, 'buscador/kolb_form.html', context)
  if q4 not in request.POST.keys():
    context['error'] = True
    return render(request, 'buscador/kolb_form.html', context)
  kolb_profile1 = request.POST[q1]
  kolb_profile2 = request.POST[q2]
  kolb_profile3 = request.POST[q3]
  kolb_profile4 = request.POST[q4]
  listQ = map(int,[kolb_profile1, kolb_profile2, kolb_profile3, kolb_profile4])
  return listQ

def calificar_kolb(resultados):
  e_c = resultados[0]
  o_r = resultados[1]
  c_a = resultados[2]
  e_a = resultados[3]
  ca_ec = c_a - e_c
  ea_or = e_a - o_r
  if ca_ec < 0 and ea_or < 0:
    return 'Divergente'
  if ca_ec < 0 and ea_or > 0:
    return 'Adaptador'
  if ca_ec > 0 and ea_or < 0:
    return 'Asimilador'
  if ca_ec > 0 and ea_or > 0:
    return 'Convergente'

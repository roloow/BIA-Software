# -*- coding: utf-8 -*-
from django.core.management.base import BaseCommand, CommandError
from django.conf import settings
from buscador.models import KolbModel

class Command(BaseCommand):
    help = 'This command generates a moderator profile user'

    def add_arguments(self, parser):
        parser.add_argument('-s', '--start', dest='start', action='store_true', help='If true, it delete all KolbModel objects and starts with the basics initial 4.')
        parser.add_argument('-n', '--new', dest='new', action='store_true', help='Manual create of an KolbModel object.')

    def handle(self, *args, **options):
        # python manage.py kolb --start --new
        if options['start'] and options['new']:
            print 'You are not allowed to present both actions at onces, please set only one of them.'
            return None

        # python manage.py kolb --start
        if options['start']:
            quantity = len(KolbModel.objects.all())
            if quantity > 0:
                validation = str(raw_input('Are you sure you want to delete the '+str(quantity)+' objects and restart the model. (y/n)'))
                validation = validation.lower().replace(' ', '')
            if quantity == 0:
                validation = 'y'
            if quantity < 0:
                print 'ERROR: KolbModel cannot be reached or signal found negative quantity of objects. Its recommended to erase your database and reconfigure the system.'
                return None
            if validation == 'y':
                KolbModel.objects.all().delete()
                perfil1 = KolbModel()
                perfil2 = KolbModel()
                perfil3 = KolbModel()
                perfil4 = KolbModel()
                perfil1.nombre = 'Acomodador'
                perfil1.description = 'Persona con aprendizaje social, utiliza la experimentacion. Pragmático y activo.'
                perfil2.nombre = 'Divergente'
                perfil2.description = 'Persona cognitiva, utiliza el actuar. Sentir y observador.'
                perfil3.nombre = 'Asimilador'
                perfil3.description = 'Persona conductista, utiliza la reflexion. Pensar y teorico.'
                perfil4.nombre = 'Convergente'
                perfil4.description = 'Persona constructivista, utiliza la teorizacion. Hacer y reflexivo.'
                perfil1.save()
                perfil2.save()
                perfil3.save()
                perfil4.save()
                print 'Se han agregado correctamente los perfiles.'
                return None
            if validation == 'n':
                print 'Action was canceled.'
                return None
            else:
                print 'ERROR: You may only use [y] [Y] [n] [N] as a response.'
                return None
        if options['new']:
            print 'This version of the software doesnt allowed to create new Cognitive Profiles.'
            return None
        print 'ERROR: no command given. Use --help to know about the usage.'
        return None

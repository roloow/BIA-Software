# -*- coding: utf-8 -*-
from django.core.management.base import BaseCommand, CommandError
from django.conf import settings
from django.contrib.auth.models import User
from buscador.models import ClientModel
from getpass import getpass

class Command(BaseCommand):
    help = 'This command generates a moderator profile user'

    def add_arguments(self, parser):
        parser.add_argument('-e', '--email', dest='email', type=str, help='The email which is going to be set as log in name.')

    def handler(self, *args, **options):
        # python manage.py moderator -e nombre@email.com
        if options['email']:
            email = options['email']
            if '@' not in email:
                print 'ERROR: email not found.'
                return None
            if ClientModel.objects.filter(auth_user__email=email):
                print 'A user with that email, already exists. In next releases, we will allowed to upgrade a Client to Moderator.'
                return None
            first_name = 'default first name'
            last_name = 'default last name'
            validation = str(raw_input('Do you want to specify all attributes for the user? (y/n)\nNOTE: This action may be done after creating in the plataform.\n'))
            if validation.lower() == 'y':
                first_name = str(raw_input('First name: '))
                last_name = str(raw_input('Last name: '))
            if validation.lower() == 'n':
                print 'The default values are going to be use.'
            else:
                return None
            pw = getpass('Enter password: ')
            pw2 = getpass('Repeat password: ')
            if pw == pw2:
                user = User.objects.create_user(email, email, pw)
                user.first_name = first_name
                user.last_name = last_name
                user.save()
                client = ClientModel()
                client.auth_user = user
                client.active = True
                client.is_moderator = True
                client.save()
                print 'Client Successfully created.'
                return None
            if pw != pw2:
                print 'ERROR: Passwords didnt match.'
                return None

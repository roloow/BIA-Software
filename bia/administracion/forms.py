from django import forms
from buscador.models import DataModel

class DocumentForm(forms.ModelForm):
    username = forms.CharField()
    fullname = forms.FileField()
    class Meta:
        model = DataModel
        fields = ()

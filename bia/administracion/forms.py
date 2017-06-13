from django import forms
from buscador.models import DataModel, TypeModel

class DocumentForm(forms.ModelForm):
    username = forms.CharField()
    fullname = forms.FileField()
    class Meta:
        model = DataModel
        fields = ()

class TypeImageForm(forms.ModelForm):
    nombre = forms.CharField()
    image = forms.ImageField(required=False)
    class Meta:
        model = TypeModel
        fields = ('nombre', 'image')

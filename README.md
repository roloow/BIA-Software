# Ingenieria de Software

Este proyecto está descrito en la sección Documentos, donde se encontrarán archivos de modelamiento y la propuesta presentada al cliente. A grandes rasgos es un sistema web de búsqueda con auto filtrado sobre un sistema de tags. Estos tags diferencian tipo de archivo, prioridad de valorización y utilidad según un perfil cognitivo para el estilo de aprendizaje.

## Perfiles de Kolb

Definiremos levemente los 4 perfiles que se aplicarán en el sistema según su capacidad de aprendizaje según el *Test de Kolb* mediante la siguiente imagen.
![Perfiles de Kolb](https://i0.wp.com/www.actualidadenpsicologia.com/wp-content/uploads/2015/06/dimensiones_aprendizaje_Kolb.png?resize=696%2C367&ssl=1)

## Sistema BIA (*Búsqueda de Información Automática*)

Para este proyecto utilizaremos el framework Web de **Python** llamado **Django** el cual será utilizado como *Front y Back-end*, a su vez para *Front-End* nos basaremos en su mayoría en *Django Templates* pero añadiremos el uso de *JavaScript*, más puntualmente **VueJS**, para acciones dinámicas.

### Pre-requisitos obligatorio

Es imperativo la instalación de *Python* que en nuestro caso utilizaremos [Python 2.7](https://www.python.org/ftp/python/2.7.13/python-2.7.13.msi)

### Pre-requisitos opcional

Aconsejamos la utilización de dos herramientas *virtualenv* y *pip*, dado que se instalarán algunos paquetes de python se aconseja la utilización de un ambiente virtual para no instalar globalmente paquetes posiblemente basura, y pip (gestor de paquetes) permitirá la instalación más sencilla de estos mismos.

Lo primero será crear y activar el ambiente de desarrollo

```
:> cd CarpetaDestino
:CarpetaDestino> virtualenv .
:CarpetaDestino> .\Scripts\activate
(CARPET) :CarpetaDestino> 
```
Una vez aparesca el **(CARPET)** significará que se ha activado correctamente. Es tiempo de instalar los paquetes de python

```
(CARPET) :CarpetaDestino> pip install -r requirements.txt
```
Habiendo realizado esto podemos iniciar el sistema desde la carpeta BIA

```
(CARPET) :CarpetaDestino> cd BIA
(CARPET) :CarpetaDestino\BIA> python manage.py runserver
```

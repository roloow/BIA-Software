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
### Paquetes y configuraciones iniciales

Una vez aparesca el **(CARPET)** significará que se ha activado correctamente. Es tiempo de instalar los paquetes de python

```
(CARPET) :CarpetaDestino> pip install -r requirements.txt
```
Habiendo realizado esto podemos proceder a los ajustes iniciales de la aplicación. Para esto deberemos utilizar comandos* del sistema. (*Los comandos se encuentran más detallados en la sección Comandos*)

```
(CARPET) :CarpetaDestino> cd BIA
(CARPET) :CarpetaDestino\BIA> python manage.py makemigrations
(CARPET) :CarpetaDestino\BIA> python manage.py migrate
(CARPET) :CarpetaDestino\BIA> python manage.py kolb --start
(CARPET) :CarpetaDestino\BIA> python manage.py runserver
```

Si por algún motivo llegase a generarse un error sobre la base de datos o migraciones, se aconseja la eliminación de las carpetas "migrations" de cada sub-aplicación además de eliminar la base de datos (sqlite) y luego proceder a realizar los pasos anteriores. Si no se crean las carpetas de las sub-aplicaciones, usted puede realizar una migración particular. Notese que **app** es equivalente a **[buscador]** y **[administración]**.

```
(CARPET) :CarpetaDestino\BIA> python manage.py makemigrations app
(CARPET) :CarpetaDestino\BIA> python manage.py migrate
```

### Usuarios

Los usuarios son creados de manera genérica mediante el servicio web y estos toman un rol de cliente el cual tiene asociado un perfil cognitivo. Sin embargo los usuarios moderadores pueden ser creados de manera manual mediante un comando

```
(CARPET) :CarpetaDestino\BIA> python manage.py moderator --email name@email.com
```

## Comandos

#### Kolb
 Este comando está diseñado para crear los perfiles cognitivos de la aplicación. Es completamente imperativo la utilización de este comando en sistemas nuevos dado que el funcionamiento del servicio y la creación de los usuarios depende de esto. El comando cuenta con dos funcionalidades *start* y *new*.
 * **start**

 Equivale a eliminar cualquier registro existente previo sobre los perfiles cognitivos (esto evita los problemas de basura en la creación de un nuevo sistema) Este comando **NO** debe utilizarse en sistemas consolidados dado que no elimina relaciones independientes y puede generar un problema de asociación. Los perfiles que crea son 4 y estos están descritos en la imagen inicial de este *Readme*.
 ```
 (CARPET) :CarpetaDestino\BIA> python manage.py kolb --start
 (CARPET) :CarpetaDestino\BIA> python manage.py kolb -s
 ```
 * **new**

 Equivale a la creación individual de un nuevo perfil. Si bien Kolb divide en 4 perfiles, dejamos un supuesto donde puede llegar a necesitarse una alteración para lo cual mediante este comando se puede crear un perfil nuevo , los datos necesarios como nombre y descripción son pedidos manualmente por consola.
 ```
 (CARPET) :CarpetaDestino\BIA> python manage.py kolb --new
 (CARPET) :CarpetaDestino\BIA> python manage.py kolb -n
 ```
 * **help**

 Como todo comando, este cuenta con la opción *help* donde se explican las funcionalidades por consola.
 ```
 (CARPET) :CarpetaDestino\BIA> python manage.py kolb --help
 (CARPET) :CarpetaDestino\BIA> python manage.py kolb -h
 ```

#### Moderator
Este comando está diseñado para crear usuarios con capacidad de moderador, esto quiere decir que tiene permitido subir material y categorizarlo, *además de subir fuentes de internet donde podrán ser adquirido el material automáticamente* (Planteamiento de futuras implementaciones). El comando cuenta con una sola funcionalidad *email*, la que creará un nuevo usuario. En próximas versiones se pretende dar la posibilidad de **upgrade** a un usuario ya creado.
* **email**

Equivale a entregar el correo del usuario el cual será también su nombre de usuario. Datos como nombre y apellidos pueden (como no) ser entregado vía consola.
```
(CARPET) :CarpetaDestino\BIA> python manage.py moderator --email example@email.com
(CARPET) :CarpetaDestino\BIA> python manage.py moderator -e example@email.com
```
* **help**

Como todo comando, este cuenta con la opción *help* donde se explican las funcionalidades por consola.
```
(CARPET) :CarpetaDestino\BIA> python manage.py moderator --help
(CARPET) :CarpetaDestino\BIA> python manage.py moderator -h
```

# openlayers-material
Openlayers con Material Design Lite

# Visor de datos geográficos Cirene

## Requerimientos:
-----------------

- Openlayers v4.0: Biblioteca de Javascript para Mapas en la Web
- Gulp: Systema de Construcción y Automatización de Flujo de Trabajo
- Bower: Gestor de Paquetes Web
- NPM: Gestor de Paquetes de NodeJS, gestiona también bibliotecas JS del lado del Cliente

## Utiliza recomendaciones de estilo estándar:

- JSHint: http://jshint.com/docs
- JSDoc: http://usejsdoc.org/about-getting-started.html

## Instalación entorno de desarrollo:

Solo se necesita ejecutar el script llamado *install*

```bash
$ ./install
```
## Ejecutar entorno de desarrollo:

Solo se necesita ejecutar el script llamado *run*

```bash
$ ./run
```

Para más comandos?

```bash
$ ./run --help
```

## Despliegue de la aplicación

La aplicación necesita un servidor web (Apache, NGINX u otro).

Los archivos del directorio ***app*** deben ser copiados en el servidor web.

Para entornos de producción puede buscar la aplicación "comprimida" o "minimizada" en ***dist***
y desplegarla de igual manera que con el código fuente.

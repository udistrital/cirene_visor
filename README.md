[![Build Status Travis CI](https://travis-ci.org/udistrital/cirene_pruebas.svg?branch=master)](https://travis-ci.org/udistrital/cirene_pruebas)

# openlayers-material
Openlayers con Material Design Lite

# Visor de datos geográficos Cirene

## Requerimientos:

- NPM: Gestor de Paquetes de NodeJS, gestiona también bibliotecas JS del lado del Cliente

## Otro software usado en la construcción:

- Openlayers v4.0: Biblioteca de Javascript para Mapas en la Web
- Gulp: Systema de Construcción y Automatización de Flujo de Trabajo
- Bower: Gestor de Paquetes Web

## Utiliza recomendaciones de estilo estándar:

- JSHint: http://jshint.com/docs (cambió)
- JSDoc: http://usejsdoc.org/about-getting-started.html

## Instalación entorno de desarrollo:

Solo se necesita ejecutar:

```bash
npm install
npm run bower:install
```
## Ejecutar entorno de desarrollo:

Solo se necesita ejecutar:

```bash
npm start
```

## Construir artefactos de la aplicación:

Solo se necesita ejecutar:

```bash
npm run build
```

Esto crea un directorio ***dist*** con el código "minificado" y el paquete,
***build/pack.tar.gz*** con todo el código en un único fichero.

## Despliegue de la aplicación

La aplicación necesita un servidor web (Apache, NGINX u otro).

Los archivos del directorio ***app*** deben ser copiados en el servidor web.

Para entornos de producción puede buscar la aplicación "comprimida" o
"minimizada" en ***dist*** y desplegarla de igual manera que con el código fuente.

# Enlaces de interés
- http://openlayers.org/en/latest/examples/
- http://www.acuriousanimal.com/thebookofopenlayers3/
- http://www.matteoagosti.com/blog/2013/02/24/writing-javascript-modules-for-both-browser-and-node/

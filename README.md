# Visor de datos geográficos del acueducto

## Requerimientos:
-----------------

- ArcGIS Javascript: Biblioteca de Javascript para Mapas en la Web
- Gulp: Systema de Construcción y Automatización de Flujo de Trabajo
- Bower: Gestor de Paquetes Web
- NPM: Gestor de Paquetes de NodeJS, gestiona también bibliotecas JS del lado del Cliente
- Proxy ArcGIS: Permite hacer túnel de las peticiones más grandes que las de GET
que son alrededor de 2000 carácteres (2048).

## Utiliza recomendaciones de estilo estándar:

- StandardJS: http://standardjs.com/rules.html
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

La aplicación necesita un servidor web (Apache, NGINX u otro) que tenga un
FastCGI (O similar) con PHP 5.4.2 o posterior. Opcionalmente se puede con
otros lenguajes. [Ver](CONFIG_ARCGIS_PROXY.md).

Los archivos del directorio ***app*** deben ser copiados en el servidor web
junto con el directorio ***arcgis*** que provee el proxy de ArcGIS.

Para entornos de producción puede buscar la aplicación "comprimida" en ***dist***
y desplegarla de igual manera que con el código fuente.

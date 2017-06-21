# Cómo configurar los servicios en el archivo *servicios.json*
El archivo *servicicios.json* se compone de un arreglo de capas consumidas como servicios, a continuación se ponen algunos ejemplos.

## Agregar WMSServer (WMS ArcGIS)
Ejemplo:
```json
{
  "serviceId": 0,
  "serviceType": "WMSServer",
  "name": "Mapa Referencia IDECA",
  "id": "ideca2",
  "url": "http://serviciosgis.catastrobogota.gov.co/arcgis/services/Mapa_Referencia/Mapa_Referencia/MapServer/WMSServer",
  "layers": "49,46,38,40,39,25,23,14,12,15,8,4",
  "opacity": 1,
  "type": "",
  "groupId": "urbano",
  "visible": true,
  "enable": true
}
```
Este se compone de algunos parámetros.

 - **serviceId** (integer, NO IMPLEMENTADO): contiene un número que ayuda a la referenciación del objeto como servicio.
 - **serviceType** (string, requerido): para que sea de este tipo debe ser "WMSServer".
 - **name** (string, requerido): nombre del servicio para ser visualizado en TOC y leyenda.
 - **id** (string, requerido): nombre del servicio para ser usado dentro de las consultas internas del visor, se recomienda NO usar mayúsculas, espacios o acentos.
 - **url** (string, requerido): url del WMS de ArcGIS puede ser relativa o absoluta, no debe contener parámetros adicionales.
 - **layers** (string, no requerido): nombres de las capas separados por comas, estos nombres pueden ser números o letras pero deben ser siempre separadas por coma, las primeras capas van abajo y las últimas encima.
 - **opacity** (float, no requerido): es el nivel de opacidad (no transparencia) de una capa, es un valor que puede ser decimal entre 0 y 1. Predeterminado en 1.
 - **type** (NO IMPLEMENTADO AUN): PERMITE DIFERENCIAR ENTRE SUB TIPOS DE ESTA CAPA.
 - **groupId** (string, requerido): es el identificador del grupo de capas descrito en el archivo *grupos.json*
 - **visible** (bool, no requerido): este tiene dos valores, true o false, cuando es true la capa se será visible de manera predeterminada, en false, tendrá que habilitarse manualmente en el TOC.
 - **enable** (bool, no requerido): está predeterminado en true, permite habilitar o deshabilitar la capa en cuestión, no se agrega al visor si su valor es false.

 ## Agregar WFS (Web Featre Service, geoserver)
 Ejemplo:
 ```json
 {
   "serviceId": 2,
   "serviceType": "WFS",
   "name": "Localidades Bogotá",
   "id": "localidades_bogota",
   "url": "/geoserver/SIGUD/ows?service=WFS&version=1.0.0&request=GetFeature&typename=SIGUD:Localidades&outputFormat=application%2Fjson",
   "filter": "",
   "filters": [{
     "_comment": "Probar con https://regex101.com/ debe retornar true, false",
     "name": "Piso 8",
     "filter": "/08$/.test(feature.get('id_nivel'))"
   }, {
     "name": "Piso 7",
     "filter": "/07$/.test(feature.get('id_nivel'))"
   }],
   "select": "multiple",
   "opacity": 1,
   "strokeColor": "rgba(255, 255, 255, 1.0)",
   "fillColor": "rgba(255, 255, 255, 0.1)",
   "iconImage": "css/img/facultad.png",
   "type": "",
   "groupId": "sedes",
   "visible": true,
   "enable": true
 }
```
Este se compone de algunos parámetros.

- **serviceId** (integer, NO IMPLEMENTADO):** contiene un número que ayuda a la referenciación del objeto como servicio.
- **serviceType** (string, requerido) para que sea de este tipo debe ser "WFS".
- **name** (string, requerido): nombre del servicio para ser visualizado en TOC y leyenda.
- **id** (string, requerido): nombre del servicio para ser usado dentro de las consultas internas del visor, se recomienda NO usar mayúsculas, espacios o acentos.
- **url** (string, requerido): url del WFS, puede ser relativa o absoluta, no debe contener parámetros adicionales.
- **filter** (string, no requerido): con este parámetro se puede filtrar toda la capa por operaciones boleanas o expresión regular, estas están expresadas en lenguaje javascript. Algunos ejemplos son:
```js
cql filter: nivel = 10
filter: feature.get('nivel') === 10
```
```js
cql filter: PARAM1 >= 'B' AND PARAM1 <= 'O'
javascript filter: feature.get('PARAM1') >= 'B' && feature.get('PARAM1') <= '0'
```
```js
cql filter: PARAM1 = 'A' OR PARAM1 = 'Z'
javascript filter: feature.get('PARAM1') === 'B' || feature.get('PARAM1') === 'Z'
```
```js
cql filter: PARAM1 LIKE 'NU%'
javascript filter: /NU$/.test(feature.get('PARAM1'))
```
- **filters** (filter objects array, no requerido): para hacer un select de filtros en la capa se puede poner filtros en un arreglo para ser seleccionados en el TOC, este puede ser de selección única o multiple (ver parámetro *select*). Ejemplos de objetos *filter objects*.
```json
[
  {
    "name": "Sub Filtro 1",
    "filter": "/07$/.test(feature.get('id_nivel'))"
  }
]
```
En donde *name* es el nombre del filtro y filter es un tipo de filtro como el del parámetro *filter*.
- **select** (select atributes string, no requerido): en caso de que exista el parámetro *filters* este se utilizar para poner  atributos (https://www.w3schools.com/tags/tag_select.asp), ejemplos de valores "multiple".
- **opacity** (float, no requerido): es el nivel de opacidad (no transparencia) de una capa, es un valor que puede ser decimal entre 0 y 1. Predeterminado en 1.
- **strokeColor** (css color string, no requerido): es el color del trazo de los objetos que se dibujarán en el mapa. Predeterminado en *rgba(255, 255, 255, 0.1)*.
- **fillColor** (css color string, no requerido): es el color del relleno de los objetos que se dibujarán en el mapa. Predeterminado en *rgba(255, 255, 255, 1.0)*.
- **iconImage** (string, no requerido): si el WFS contiene puntos, se puede opcionalmente poner la URL relativa o absoluta de una imagen para los puntos, esto hará inválida e innecesaria la opción de *strokeColor* y *fillColor* para los puntos, ya que se toma con preponderación el parámetro *iconImage*.
- **type** (NO IMPLEMENTADO): PERMITE DIFERENCIAR ENTRE SUB TIPOS DE ESTA CAPA.
- **groupId** (string, requerido): es el identificador del grupo de capas descrito en el archivo *grupos.json*
- **visible** (bool, no requerido): este tiene dos valores, true o false, cuando es true la capa se será visible de manera predeterminada, en false, tendrá que habilitarse manualmente en el TOC.
- **enable** (bool, no requerido): está predeterminado en true, permite habilitar o deshabilitar la capa en cuestión, no se agrega al visor si su valor es false.

## Agregar MapServer (Servicio MapServer de ArcGIS) NO IMPLEMENTADO
Ejemplo:
```json
{
  "serviceId": 15,
  "serviceType": "MapServer",
  "name": "OrtoFoto Bogotá",
  "id": "Ortho2014",
  "url": "http://serviciosgis.eastus.cloudapp.azure.com/arcgis/rest/services/Imagenes/Ortho2014/MapServer",
  "opacity": 0.8,
  "type": "ArcGISTiledMapServiceLayer",
  "enable": false
}
```
Este se compone de algunos parámetros.

- **serviceId** (integer, NO IMPLEMENTADO):** contiene un número que ayuda a la referenciación del objeto como servicio.
- **serviceType** (string, requerido) para que sea de este tipo debe ser "MapServer".
- **name** (string, requerido): nombre del servicio para ser visualizado en TOC y leyenda.
- **id** (string, requerido): nombre del servicio para ser usado dentro de las consultas internas del visor, se recomienda NO usar mayúsculas, espacios o acentos.
- **url** (string, requerido): url del WFS, puede ser relativa o absoluta, no debe contener parámetros adicionales.
- **opacity** (float, no requerido): es el nivel de opacidad (no transparencia) de una capa, es un valor que puede ser decimal entre 0 y 1. Predeterminado en 1.
- **type** (NO IMPLEMENTADO): PERMITE DIFERENCIAR ENTRE SUB TIPOS DE ESTA CAPA.
- **groupId** (string, requerido): es el identificador del grupo de capas descrito en el archivo *grupos.json*
- **visible** (bool, no requerido): este tiene dos valores, true o false, cuando es true la capa se será visible de manera predeterminada, en false, tendrá que habilitarse manualmente en el TOC.
- **enable** (bool, no requerido): está predeterminado en true, permite habilitar o deshabilitar la capa en cuestión, no se agrega al visor si su valor es false.

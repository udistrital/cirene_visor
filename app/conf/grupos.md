# Cómo configurar los servicios en el archivo *servicios.json*
El archivo *servicicios.json* se compone de un arreglo de grupos de capas, a continuación se ponen algunos ejemplos.

## Agregar Nuevo Grupo
Ejemplo:
```json
{
  "id": "grupo_1",
  "name": "Grupo de Capas N° 1"
}
```
Este se compone de algunos parámetros.

 - **id** (string, requerido): id del grupo de servicios para ser usado dentro de las consultas internas del visor, se recomienda NO usar mayúsculas, espacios o acentos.
 - **name** (string, requerido): nombre para ser mostrado en el TOC.

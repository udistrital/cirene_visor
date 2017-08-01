describe("Validar createMap.js", function() {
  it("Se puede crear el mapa exitosamente.", (function() {
    // Valida por lo menos la sintaxis.
    document.write('<div id="map"></div>');
    document.write('<div id="toc-div"></div>');
    document.write('<div id="popup"></div>');
    document.write('<div id="popup-content"></div>');
    document.write('<div id="popup-closer"></div>');
    this.global.servicios = [{
      "serviceId": 0,
      "serviceType": "WMSServer",
      "name": "Mapa Referencia IDECA Calles",
      "id": "ideca2",
      "url": "http://serviciosgis.catastrobogota.gov.co/arcgis/services/Mapa_Referencia/Mapa_Referencia/MapServer/WMSServer",
      "icon": "css/img/Ideca.jpg",
      "layers": "49,46,38,40,39,25,23,14,12,15,8,4",
      "opacity": 1,
      "type": "",
      "groupId": "urbano",
      "visible": false,
      "enable": true
    }, {
      "serviceId": 3,
      "serviceType": "WFS",
      "name": "Lotes",
      "id": "lote",
      "url": "/geoserver/SIGUD/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=SIGUD:vista_lotes&outputFormat=application%2Fjson",
      "icon": "css/img/Lote.jpg",
      "opacity": 1,
      "strokeColor": "rgba(0, 255, 255, 1.0)",
      "type": "",
      "groupId": "urbano",
      "visible": true,
      "enable": true
    }];

    this.global.grupoServicios = [{
      "id": "sedes",
      "name": "Capas Escala Sedes"
    }, {
      "id": "arquitectonica",
      "name": "Capas Escala Arquitectónica"
    }, {
      "id": "urbano",
      "name": "Capas Escala Urbana"
    }];
    this.createMap();
  }).bind(window._scopeCreateMap));
});

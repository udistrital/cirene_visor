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
      "id": "ideca",
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

    var result = this.createMap();
    expect(result).toBe(undefined);

    var result = $("#popup-closer")[0].click();
    expect(result).toBe(undefined);

  }).bind(window._scopeCreateMap));

  it("Se ejecutan las funciones del mapa.", (function() {

    var result = this.zoomToInitialExtent();
    expect(result).toBe(undefined);

    var result = this.changeVisibilityLayer('lote');
    expect(result).toBe(undefined);

    var result = this.changeVisibilityLayer('ideca');
    expect(result).toBe(undefined);

  }).bind(window._scopeCreateMap));

  it("Se verifican funciones globales de window.", (function() {

    var result = window.changeVisibilityLayer('ideca');
    expect(result).toBe(undefined);

    var event = document.createEvent('Event');
    event.initEvent('test', true, true);
    var result = window.changeVisibilityGroup(event, 'sedes', false);
    expect(result).toBe(undefined);

    var result = window.mapFeatureLayerObjects.length;
    expect(result).toBe(2);

    var result = window.jstsParser.geometryFactory;
    expect(typeof result).toBe('object');

    var result = window.identifyInteraction.getMap();
    expect(result === this.global.map).toBe(true);

    var result = window.map;
    expect(result === this.global.map).toBe(true);

  }).bind(window._scopeCreateMap));

});

describe("Validar generalReport.js", function() {
  it("Se prueban funciones internas.", (function() {
    var result = this.displayMessage('Mensaje de prueba.');
    expect(result).toBe(undefined);


  }).bind(window._scopeGeneralReport));

  it("Se prueban funciones globales de window.", (function() {

    var result = this.displayMessage;
    expect(result === window.generalReport.displayMessage).toBe(true);

    var result = this.loadInterfaces(window.getMap());
    expect(result).toBe(undefined);

    var result = this.loadFields('lote');
    expect(result).toBe(undefined);

    document.write('<div id="loading-report-message"></div>');
    document.write('<select id="select_layers"><option value="lote" selected></option></select>');
    document.write('<select id="select_fields"><option value="valor field" selected></option></select>');
    document.write('<select id="select_operator"><option value="equals" selected>=</option></select>');
    document.write('<input id="row_value" type="text" class="validate" value="valor">');
    var result = this.validateData();
    expect(result).toBe(undefined);

    var result = this.consultarFeatures();
    expect(result).toBe(undefined);

    var field = 'Chip';
    var operator = 'like';
    var value  = '1';
    var string_function = 'strToUpperCase';
    var result = this.generateCQL_FILTER(field, operator, value, string_function);
    expect(result).toBe('strToUpperCase("Chip") LIKE 1');

    var response = JSON.parse('{"type":"FeatureCollection","totalFeatures":27,"features":[{"type":"Feature","id":"vista_lotes.fid-626c01e2_15db8294168_-8c9","geometry":{"type":"Polygon","coordinates":[[[-8255210.837084782,510265.93868930486],[-8255202.142988626,510266.473903939],[-8255199.605984574,510266.8068496082]]]},"geometry_name":"geometria","properties":{"Código":"002412069001","Chip":"AAA0017AFYN","Sector Catastral":"VERONA","Area Urbanistica(m2)":"URBANIZACION CANDELARIA LA NUEVA SEGUNDO SECTOR 1 ETAPA","Localidad":"CIUDAD BOLIVAR","Dirección":"DG 68 D SUR 49 C 70","Predios en el Lote":0,"Area(m2)":4844.206133,"Area Construida(m2)":3642.99,"Area Universidad(m2)":4545.93,"Area Construida Universidad(m2)":4379.64}}],"crs":{"type":"name","properties":{"name":"urn:ogc:def:crs:EPSG::3857"}}}');
    var result = this.showResultFeaturesGeneralReport(response);
    expect(result).toBe(undefined);
    //loadingIcon(true, 'Consultando...');

    var point = new ol.geom.Point([5000, 5000]);
    var result = this.parseGeometry(point);
    expect(result).toBe(undefined);

    var multiPoint = new ol.geom.MultiPoint([5000, 5000]);
    var result = this.parseGeometry(multiPoint);
    expect(result).toBe(undefined);

    var lineString = new ol.geom.LineString([5000, 5000]);
    var result = this.parseGeometry(lineString);
    expect(result).toBe(undefined);

    var multiLineString = new ol.geom.MultiLineString([5000, 5000]);
    var result = this.parseGeometry(multiLineString);
    expect(result).toBe(undefined);

    var polygon = new ol.geom.Polygon([5000, 5000]);
    var result = this.parseGeometry(polygon);
    expect(result).toBe(undefined);

    var multiPolygon = new ol.geom.MultiPolygon([5000, 5000]);
    var result = this.parseGeometry(multiPolygon);
    expect(result).toBe(undefined);

    var geometryCollection = new ol.geom.GeometryCollection([point, polygon]);
    var result = this.parseGeometry(geometryCollection);
    expect(result).toBe(undefined);

    var circle = new ol.geom.Circle([5000, 5000]); // no importa si no tiene sentido geográfico
    var result = this.parseGeometry(circle);
    expect(result).toBe(undefined);

    var result = this.loadingIcon();
    expect(result).toBe(undefined);

    var result = this.loadingBar();
    expect(result).toBe(undefined);

    var result = this.consultarFeaturesRapido('chapinero');
    expect(result).toBe(undefined);

    var result = this.normalize('Chapiñero');
    expect(result).toBe('Chapinero');
    var result = this.normalize('Barça');
    expect(result).toBe('Barca');
    var result = this.normalize('Ánolaima');
    expect(result).toBe('Anolaima');
    var result = this.normalize('Chía');
    expect(result).toBe('Chia');
    var result = this.normalize('Tecnológica');
    expect(result).toBe('Tecnologica');
    var result = this.normalize('Ungüento');
    expect(result).toBe('Unguento');

  }).bind(window._scopeGeneralReport));

});

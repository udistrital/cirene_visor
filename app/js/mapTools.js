window.mapTools = {
  zoomToGeometry: function(geometry) {
    var geometryExtent = null;
    if (geometry.getType() === "Point") {
      geometryExtent = mapTools.bufferGeometry(geometry, 10).getExtent();
    } else {
      geometryExtent = geometry.getExtent();
    }
    window.map.getView().fit(geometryExtent, map.getSize());
  },
  changeFilter: function(element, layerId) {
    console.log('changeFilter', element, layerId);
    var layer = window.map.getLayer(layerId);
    var source = layer.getSource();
    var filters = $(element).val();
    var filter = '';
    if (typeof filters === 'object') { //is array
      for (var i = 0; i < filters.length; i++) {
        filter += filters[i] + ' || ';
      }
      filter = filter.substring(0, filter.length - ' || '.length);
    } else { //is string?
      filter = filters;
    }
    console.log('filter', filter);
    source.config.filter = filter;
    window.source = source;
    //source.refresh();
    source.clear(true);
  },
  measureInMap: function() {
    createMeasurement();
  },
  searchLayerRecursive: function(layers, listenFunction) {
    for (var i = 0; i < layers.length; i++) {
      //console.log('layers[i]', layers[i]);
      var layer = layers[i].Layer;
      if (typeof(layer) !== 'undefined') {
        //console.log('layers[i].Layer', layer);
        mapTools.searchLayerRecursive(layer, listenFunction);
      } else {
        //console.log('layer, layers[i]', layers[i]);
        listenFunction(layers[i]);
      }
    }
  },
  getLayerStyle: function(feature, options) { //graphic layer?
    var opt = (typeof options !== 'undefined')
      ? options
      : {};
    var layerFillColor = (typeof opt.fillColor !== 'undefined' && opt.fillColor !== '')
      ? opt.fillColor
      : 'rgba(255, 255, 255, 0.1)';
    var layerStrokeColor = (typeof opt.strokeColor !== 'undefined' && opt.strokeColor !== '')
      ? opt.strokeColor
      : 'rgba(255, 255, 255, 1.0)';
    var layerOpacity = (typeof opt.opacity === 'undefined')
      ? 1
      : opt.opacity;

    var image = null;
    if (typeof opt.iconImage !== 'undefined' && opt.iconImage !== '') {
      var imageURL = opt.iconImage;
      image = new ol.style.Icon(/** @type {olx.style.IconOptions} */
      ({
        anchor: [
          0.5, 14
        ],
        anchorXUnits: 'fraction',
        anchorYUnits: 'pixels',
        src: imageURL
      }));
    } else {
      image = new ol.style.Circle({
        radius: 5,
        fill: new ol.style.Fill({color: layerFillColor}),
        stroke: new ol.style.Stroke({color: layerStrokeColor, width: 1}),
        opacity: layerOpacity
      });
    }

    var styles = {
      'Point': new ol.style.Style({image: image}),
      'LineString': new ol.style.Style({
        stroke: new ol.style.Stroke({color: layerStrokeColor, width: 1}),
        opacity: layerOpacity
      }),
      'MultiLineString': new ol.style.Style({
        stroke: new ol.style.Stroke({color: layerStrokeColor, width: 1}),
        opacity: layerOpacity
      }),
      'MultiPoint': new ol.style.Style({image: image}),
      'MultiPolygon': new ol.style.Style({
        stroke: new ol.style.Stroke({color: layerStrokeColor, width: 1}),
        fill: new ol.style.Fill({color: layerFillColor}),
        opacity: layerOpacity
      }),
      'Polygon': new ol.style.Style({
        stroke: new ol.style.Stroke({color: layerStrokeColor, lineDash: [4], width: 3}),
        fill: new ol.style.Fill({color: layerFillColor}),
        opacity: layerOpacity
      }),
      'GeometryCollection': new ol.style.Style({
        stroke: new ol.style.Stroke({color: layerStrokeColor, width: 2}),
        fill: new ol.style.Fill({color: layerFillColor}),
        image: new ol.style.Circle({
          radius: 5,
          fill: null,
          stroke: new ol.style.Stroke({color: layerStrokeColor})
        }),
        opacity: layerOpacity
      }),
      'Circle': new ol.style.Style({
        stroke: new ol.style.Stroke({color: layerStrokeColor, width: 2}),
        fill: new ol.style.Fill({color: layerFillColor}),
        opacity: layerOpacity
      })
    };

    return styles[feature.getGeometry().getType()];
  },
  showResultFeatures: function(featuresByLayer) {
    var resultadosDiv = $('#resultadosDiv');
    resultadosDiv.html('');

    var accordion = '<ul class="collapsible" data-collapsible="expandable"></ul>';
    accordion = $(accordion);

    var hayResultados = false;

    for (var i = 0; i < featuresByLayer.length; i++) {
      var layer = featuresByLayer[i];
      var layerObject = window.getFeatureLayerObjectById(layer.layerId);
      var capaVisible = window.map.getLayer(layer.layerId).getVisible();
      if (capaVisible) {
        hayResultados = true;
        var contentHTML = '';
        var features = layer.features;
        if (features.length > 0) {
          for (var j = 0; j < features.length; j++) {
            var feature = features[j];
            var properties = feature.getProperties();
            var resultadoIdentificar = $('<div class="resultadoIdentificar"></div>');
            for (var property in properties) {
              if (properties.hasOwnProperty(property)) {
                if (['geometry'].indexOf(property) === -1) { //Si no esta
                  var propertySpan = $('<span><b>' + property + ':</b> ' + properties[property] + '</span>');
                  resultadoIdentificar.append(propertySpan);
                  resultadoIdentificar.append($('<br/>'));
                }
              }
            }
            var geometrySpan = $('<span><a href="#">Acercar a</a></span>');
            geometrySpan[0].geometry = properties['geometry'];
            geometrySpan.click(function() {
              mapTools.zoomToGeometry(this.geometry);
              consultas.addGeometryHighlight(this.geometry)
            });
            resultadoIdentificar.append(geometrySpan);
          }
          var header = $('<div class="collapsible-header active"><i class="material-icons tiny">play_arrow</i>' + layerObject.name + '</div>');
          var body = $('<div class="collapsible-body"></div>');
          body.append(resultadoIdentificar);
          var item = $('<li class="active"></li>');
          item.append(header);
          item.append(body);
          accordion.append(item);
        } else {
          contentHTML += '<div class="resultadoIdentificar">\n' + '   <span>No hay resultados.</span>\n' + '<div>\n';
          var item = '<li class="active">\n' +
          '  <div class="collapsible-header active"><i class="material-icons tiny">play_arrow</i>' + layerObject.name + '</div>\n' + '  <div class="collapsible-body">' + contentHTML + '</div>\n' + '</li>\n';
          item = $(item);
          accordion.append(item);
        }
      }
    }
    if (hayResultados) { //no hubo resultados
      resultadosDiv.append(accordion);
    } else {
      var contentHTML = '<h2>No hay capas activas.</h2>';
      resultadosDiv.append(contentHTML);
    }

    $('#resultadosDiv .collapsible').collapsible();

    window.sidebar.open('resultados');
  },
  identifyInLayers: function() {
    mapTools.turnOffPopup();
    $('#map').css('cursor', 'crosshair');
    var clkEvent = function(evt) {
      $('#map').css('cursor', 'default');
      $('#boton-resultados').removeClass('disabled');
      map.un('click', clkEvent);
      var coordinate = evt.coordinate;
      var featuresByLayer = searchFeaturesLayersByCoordinate(coordinate);
      console.log('features', featuresByLayer);
      mapTools.showResultFeatures(featuresByLayer);
      setTimeout(function() {
        mapTools.turnOnPopup();
      }, 2000);
    }
    map.on('click', clkEvent);
  },
  hideOverlays: function() {
    var overlays = map.getOverlays().getArray();
    for (var i = 0; i < overlays.length; i++) {
      overlays[i].setPosition(undefined);
    }
  },
  bufferGeometry: function(geometry, meters) {
    meters = (typeof meters !== 'undefined')
      ? meters
      : 0;

    var sourceProj = map.getView().getProjection();
    var transformedGeometry = (geometry.clone().transform(sourceProj, 'EPSG:3857'));
    var jstsGeom = jstsParser.read(transformedGeometry); //Only accept 3857
    console.log('jstsGeom', jstsGeom);
    // create a buffer of 1 meters around each line
    var buffered = jstsGeom.buffer(meters);

    // convert back from JSTS and replace the geometry on the feature
    var bufferedGeometry = jstsParser.write(buffered);
    return bufferedGeometry.transform('EPSG:3857', sourceProj);
  },
  turnOffPopup: function() {
    window.identifyInteraction.getFeatures().clear();
    mapTools.hideOverlays();
    map.removeInteraction(window.identifyInteraction);
  },
  turnOnPopup: function() {
    map.addInteraction(window.identifyInteraction);
  },
  cleanMap: function() {
    window.identifyInteraction.getFeatures().clear();
    this.hideOverlays();
    consultas.cleanHighlight();
  }
}

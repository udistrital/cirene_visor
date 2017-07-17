var map;
var toolbar;
var esriConfig;
var servicios;
var grupoServicios;
var navToolbar;
var geometriaAnalisis;
var jstsParser;
var listOfNavigationsInteractions = [];
var identifyInteraction = null;

$(function() {
  console.log("Ready!");
  loadData();
});

function loadData() {
  var serviciosPromise = $.get('conf/servicios.json');
  var gruposPromise = $.get('conf/grupos.json');

  $.when(serviciosPromise, gruposPromise).done(function(servicios, grupos) {
    // do something
    console.log('results', servicios, grupos);
    window.servicios = servicios[0];
    window.grupoServicios = grupos[0];
    createMap();
  });
}

function createMap() {

  window.jstsParser = new jsts.io.OL3Parser();

  //var projection = new ol.proj.Projection({code: 'EPSG:4326', units: 'degrees', axisOrientation: 'neu'});

  var map = new ol.Map({
    //layers: [osmLayer, wmsLayer, grupoislaLayer, islaLayer],
    //overlays: [overlay],
    target: document.getElementById('map'),
    view: new ol.View({
      //projection: projection,
      center: [
        -8248199.896347591, 510943.79974994034
      ],
      // extent: [ //Esto limita el mapa a esta extension
      //   -74.18615000043059, 4.514284463291831, -73.92439112512187, 4.659751162274072
      // ],
      zoom: 12,
      maxZoom: 26
    }),
    controls: ol.control.defaults().extend([new ol.control.ScaleLine()])
  });
  window.map = map;

  map.getLayer = window._getLayerById;

  addLayers();
  addZoomSlider();
  //checkVisibilityAtScale()
  //add the legend
  createLegend();
  createTOC();
  createIdentify();
  zoomToInitialExtent();
  consultas.addLayerHighlight();
  generalReport.loadInterfaces();
  //createMeasurement();
}

function zoomToInitialExtent() {
  // var initialExtent = map.getLayer('sede_punto').getSource().getExtent();
  var initialExtent = [-8258364.441961344, 503048.5820093646, -8229225.577251358, 520654.68434993026];
  map.getView().fit(initialExtent, map.getSize());
}

function addLayers() {
  // Base map
  var osmLayer = new ol.layer.Tile({source: new ol.source.OSM()});

  map.addLayer(osmLayer);

  // format used to parse WFS GetFeature responses
  var geojsonFormat = new ol.format.GeoJSON();

  window.mapFeatureLayerObjects = [];

  var servicios = window.servicios;

  var wfsLoader = function(extent, resolution, projection) {
    var indice = this.indice;
    var wfsSource = this;
    var url = servicios[indice].url + '&srsname=EPSG:3857&bbox=' + extent.join(',') + ',EPSG:3857';
    if (url.toLowerCase().indexOf('maxfeatures') !== -1) {
      window.alert('Por favor, retire el parámetro maxFeatures de la url del servicio ' + servicios[indice].id + '.');
    }
    // use jsonp: false to prevent jQuery from adding the "callback"
    // parameter to the URL
    $.ajax({url: url, dataType: 'json', jsonp: false}).done(function(response) {
      var features = geojsonFormat.readFeatures(response);
      var filter = wfsSource.config.filter;
      if (typeof filter !== 'undefined' && filter !== '') {
        //window.features = features;
        features = features.filter(function(feature) {
          console.log('eval(filter)', eval(filter), wfsSource.config.id);
          return eval(filter);
        });
      }
      wfsSource.addFeatures(features);
    });
  };

  for (var i = 0; i < servicios.length; i++) {
    var servicio = servicios[i];
    if (typeof servicio.enable === 'undefined' || servicio.enable === true) {
      if (servicio.serviceType === 'WFS') {
        window.mapFeatureLayerObjects.push(servicio);
        var wfsSource = new ol.source.Vector({
          loader: wfsLoader,
          strategy: ol.loadingstrategy.tile(ol.tilegrid.createXYZ({maxZoom: 19}))
        });
        wfsSource.indice = i;
        wfsSource.config = servicio;

        var wfsLayer = new ol.layer.Vector({
          source: wfsSource,
          style: (function(feature) {
            var ctxServicio = this;
            return mapTools.getLayerStyle(feature, ctxServicio);
          }).bind(servicio),
          visible: (typeof servicio.visible === 'undefined')
            ? true
            : servicio.visible
        });
        wfsLayer.indice = i;

        map.addLayer(wfsLayer);
      } else if (servicio.serviceType === 'WMS') {
        window.mapFeatureLayerObjects.push(servicio);
        var wmsSource = new ol.source.TileWMS({
          url: '/geoserver/wms',
          params: {
            'LAYERS': 'parqueaderos:sotano1_50ppp_georeferenced',
            'FORMAT': 'image/png',
            'TILED': true
          },
          serverType: 'geoserver',
          crossOrigin: 'anonymous'
        });
        wmsSource.indice = i;
        wmsSource.config = servicio;

        var wmsLayer = new ol.layer.Tile({
          source: wmsSource,
          opacity: (typeof servicio.opacity === 'undefined')
            ? 1
            : servicio.opacity,
          visible: (typeof servicio.visible === 'undefined')
            ? true
            : servicio.visible
        });
        map.addLayer(wmsLayer);

      } else if (servicio.serviceType === 'WMSServer') {
        window.mapFeatureLayerObjects.push(servicio);
        var wmsServerSource = new ol.source.TileWMS({
          url: servicio.url,
          params: {
            LAYERS: servicio.layers,
            FORMAT: 'image/png'
          },
          crossOrigin: ''
        });
        wmsServerSource.indice = i;
        wmsServerSource.config = servicio;

        var wmsServerLayer = new ol.layer.Tile({
          source: wmsServerSource,
          opacity: (typeof servicio.opacity === 'undefined')
            ? 1
            : servicio.opacity,
          visible: (typeof servicio.visible === 'undefined')
            ? true
            : servicio.visible
        });
        window.milayer = wmsServerLayer;
        map.addLayer(wmsServerLayer);

      } else if (servicio.serviceType === 'FeatureServer') {
        for (var j = 0; j < servicio.layers.length; j++) {
          var layer = servicio.layers[j];
          if (layer.enable) {
            var url = servicio.url + '/' + layer.layerId;

            var infoTemplate = new InfoTemplate();
            infoTemplate.setTitle(layer.name);
            var templateContent = generateTemplateContent(layer, i, j);
            infoTemplate.setContent(templateContent);

            var featureLayer = new FeatureLayer(url, {
              id: layer.id,
              mode: FeatureLayer[servicio.mode],
              outFields: ['*'],
              infoTemplate: infoTemplate,
              visible: layer.visible
              // maxAllowableOffset: calcOffset()
            });

            window.mapFeatureLayerObjects.push(layer);
            // featureLayer.setMaxScale(layer.maxScale)
            // featureLayer.setMinScale(layer.minScale)
            map.addLayer(featureLayer);
          }
        }
      }
    }
  }
}

function createLegend() {
  // link: http://docs.geoserver.org/stable/en/user/services/wms/reference.html
  // link: https://openlayers.org/en/latest/examples/wms-capabilities.html
  var legendDiv = $('#legendDiv');
  var layers = map.getLayers().getArray();
  for (var i = 0; i < layers.length; i++) {
    var layer = layers[i];
    var source = layer.getSource();
    if (typeof(source.config) !== 'undefined') {
      var type = source.config.serviceType;
      if (type === 'WMSServer' || type === 'WMS') {
        $.get(source.config.url + '?service=wms&version=1.1.1&request=GetCapabilities', function(response) {
          generateHTMLLegendWMS(response);
        });
      } else if (type === 'WFS') {
        generateHTMLLegendWFS(source.config);
      }
    }
  }
}

function generateHTMLLegendWMS(response) {
  var legendDiv = $('#legendDiv');
  var parser = new ol.format.WMSCapabilities();
  var result = parser.read(response);
  window.result = result;
  var layer = result.Capability.Layer;
  var layers = layer.Layer;
  var item = '<li class="collection-header">\n' +
  '     <h5>' + layer.Title + '</h5>\n' + '</li>\n';
  legendDiv.append(item);

  var collapsible = '<ul class="collapsible" data-collapsible="expandable">\n' +
  '</ul>\n';
  collapsible = $(collapsible);
  legendDiv.append(collapsible);

  mapTools.searchLayerRecursive(layers, function(layer) {
    var url = layer.Style[0].LegendURL[0].OnlineResource;
    var title = layer.Title;
    if (url) {
      var item = '<li>\n' +
      '  <div class="collapsible-header item-leyenda-wms-title"><i class="material-icons tiny">play_arrow</i>' + title + '</div>\n' + '  <div class="collapsible-body item-leyenda-wms-content"><span><img src="' + url + '" /></span></div>\n' + '</li>\n';
      collapsible.append(item);
    }
  });
  $('#legendDiv .collapsible').collapsible();
}

function generateHTMLLegendWFS(config) {
  var legendDiv = $('#legendDiv');
  var layer = config;

  var style = '';
  if (typeof layer.iconImage !== 'undefined' && layer.iconImage !== '') {
    style = 'background-image:url(' + layer.iconImage + '); background-size: 100% 100%; border-style: none;';
  } else {
    style = 'border-color:' + layer.strokeColor + ';border-style: dashed;';
  }

  var item = '<li class="collection-header collection-item">\n' +
  '     <h5>' + layer.name + '</h5>\n' + '     <span class="leyenda-icon" style="' + style + '"></span>\n' + '</li>\n';
  legendDiv.append(item);
}

function createTOC() {
  var toc = $('#toc-div');
  var collapsible = '<ul class="collapsible" data-collapsible="accordion">';
  var i,
    li;
  for (i = 0; i < window.grupoServicios.length; i++) {
    var grupo = window.grupoServicios[i];
    var active = (i === 0)
      ? 'active'
      : '';
    li = '<li> ' +
      '     <div class="collapsible-header ' + active + '">\n' + '        <i class="material-icons">layers</i>\n' + '        ' + grupo.name + '\n' + '        <a href="#!" onclick="changeVisibilityGroup(event, \'' + grupo.id + '\', false)">\n' + '            <i class="material-icons btnEyeGroup">visibility_off</i>\n' + '        </a>\n' + '        <a href="#!" onclick="changeVisibilityGroup(event, \'' + grupo.id + '\', true)">\n' + '            <i class="material-icons btnEyeGroup">visibility</i>\n' + '        </a>\n' + '        </div>\n' + '    <div class="collapsible-body"><ul class="collection" data-group="' + grupo.id + '"></ul></div>\n' + '</li>\n';
    collapsible += li;
  }
  collapsible += '</ul>';
  toc.html(collapsible);

  for (i = 0; i < window.mapFeatureLayerObjects.length; i++) {
    var layer = window.mapFeatureLayerObjects[i];
    var classVisible = 'visibility';
    if (layer.visible === false) {
      classVisible = 'visibility_off';
    }
    var imageUrl = (typeof(layer.icon) === 'undefined' || layer.icon === '')
      ? 'css/img/oas.jpg'
      : layer.icon;
    var layerMaxScale = (typeof(layer.maxScale) === 'undefined')
      ? 'Inf'
      : layer.maxScale;
    var filters = '';
    var filterClass = '';
    var selectParams = '';
    if (typeof(layer.select) !== 'undefined' && layer.select !== '') {
      selectParams = layer.select;
    }
    if (typeof(layer.filters) !== 'undefined' && layer.filters !== '') {
      filterClass = ' toc-layer-filters';
      filters += '<div class="input-field col s12">\n' + '  <select onchange="mapTools.changeFilter(this, \'' + layer.id + '\')" ' + selectParams + '>\n' + '    <option value="" disabled selected>Seleccione un filtro</option>\n';

      for (var j = 0; j < layer.filters.length; j++) {
        var filter = layer.filters[j];
        filters += '<option value="' + filter.filter + '">' + filter.name + '</option>\n'
      }

      filters += '  </select>\n' +
      // '  <label>Seleccione el Filtro</label>\n' +
      '</div>\n';
    }

    li = '<li class="collection-item avatar' + filterClass + '">\n' + '    <img src="' + imageUrl + '" alt="" class="circle">\n' + '    <span class="title" style="padding-right: 22px; display: block;">' + layer.name + '</span>\n' +
    //'    <p>Desde escala 1:' + layerMaxScale + '</p>\n' +
    '    <a href="#!" onclick="changeVisibilityLayer(\'' + layer.id + '\')" class="secondary-content">\n' + '        <i class="material-icons btnEye" data-layer-icon="' + layer.id + '">' + classVisible + '</i>\n' + '    </a>\n' + filters + '</li>\n';
    var group = $('[data-group="' + layer.groupId + '"]')[0];
    group.innerHTML += li;
  }

  // Se cargan las cosas necesarias
  $('.collapsible').collapsible();
  $(toc).find('select').material_select();
  //checkVisibilityAtScale();
}

function changeVisibilityLayer(layerId) {
  var layer = map.getLayer(layerId);
  var icon = $('[data-layer-icon="' + layerId + '"]')[0];
  //window.layer = layer;
  if (layer.getVisible()) {
    layer.setVisible(false);
    icon.innerHTML = 'visibility_off';
  } else {
    layer.setVisible(true);
    icon.innerHTML = 'visibility';
  }
}

function changeVisibilityGroup(evt, groupId, visibility) {
  //evt.preventDefault()
  evt.stopPropagation();
  for (var i = 0; i < window.mapFeatureLayerObjects.length; i++) {
    var layer = window.mapFeatureLayerObjects[i];
    if (layer.groupId === groupId) {
      var olLayer = map.getLayer(layer.id);
      var icon = $('[data-layer-icon="' + layer.id + '"]')[0];
      if (visibility) {
        olLayer.setVisible(true);
        icon.innerHTML = 'visibility';
      } else {
        olLayer.setVisible(false);
        icon.innerHTML = 'visibility_off';
      }
    }
  }
}

// https://developers.arcgis.com/javascript/3/jssamples/fl_performance.html
function checkVisibilityAtScale() {
  for (var i = 0; i < window.mapFeatureLayerObjects.length; i++) {
    var scale = map.getScale();
    var layer = window.mapFeatureLayerObjects[i];
    var icon;
    if (scale >= layer.minScale && scale <= layer.maxScale) {
      map.getLayer(layer.id).setVisibility(true);
      icon = document.querySelector('[data-layer-icon="' + layer.id + '"]');
      if (icon !== null) {
        icon.innerHTML = 'visibility';
      }

    } else {
      map.getLayer(layer.id).setVisibility(false);
      icon = document.querySelector('[data-layer-icon="' + layer.id + '"]');
      if (icon !== null) {
        icon.innerHTML = 'visibility_off';
      }
    }
  }
}

function onClickButtonToolbar(signal, Draw, type) {
  map.infoWindow.unsetMap();
  navToolbar.deactivate();
  map.graphics.clear();

  toolbar.activate(Draw[type]);
  map.hideZoomSlider();
  // remove listener after first event
  //signal.remove()
  // do something else...
}

function _getLayerById(id) {
  var layers = map.getLayers().getArray();
  return layers.find(function(layer) {
    var source = layer.getSource();
    if (typeof(source.config) !== 'undefined') {
      return source.config.id === id;
    }
    return false;
  });
}

function getFeatureLayerObjectById(id) {
  return window.mapFeatureLayerObjects.find(function(featureLayerObject) {
    return featureLayerObject.id === id;
  });
}

function createIdentify() {

  /**
   * Elements that make up the popup.
   */
  var container = document.getElementById('popup');
  var content = document.getElementById('popup-content');
  var closer = document.getElementById('popup-closer');

  /**
   * Create an overlay to anchor the popup to the map.
   */
  var overlay = new ol.Overlay(/** @type {olx.OverlayOptions} */
  ({
    element: container,
    autoPan: true,
    autoPanAnimation: {
      duration: 250
    }
  }));

  window.map.addOverlay(overlay);
  /**
   * Add a click handler to hide the popup.
   * @return {boolean} Don't follow the href.
   */
  closer.onclick = function() {
    overlay.setPosition(undefined);
    closer.blur();
    return false;
  };

  var selectInteraction = new ol.interaction.Select();
  selectInteraction.on('select', function(evt) {
    console.log('evt select', evt);
    //window.evt = evt;
    var coordinate = evt.mapBrowserEvent.coordinate;

    var properties = lastFeature.getProperties();

    $(content).html('');
    var featureHTML = $('<div></div>');

    for (var property in properties) {
      if (properties.hasOwnProperty(property)) {
        var span = null;
        if (['geometry'].indexOf(property) === -1) { //Si no esta
          if (property === 'imagen') {
            span = $('<span><b>' + property + ':</b> <img src="' + properties[property] + '" style="width:200px; height:200px;"/><span/><br/>');
          } else {
            span = $('<span><b>' + property + ':</b> ' + properties[property] + '</span><br/>');
          }
          featureHTML.append(span);
        }
      }
    }

    var geometrySpan = $('<span><a href="#">Acercar</a></span>');
    geometrySpan[0].geometry = properties['geometry'];
    geometrySpan.click(function() {
      mapTools.zoomToGeometry(this.geometry);
      var newCoordinate = mapTools.getCenterOfExtent(this.geometry.getExtent());
      overlay.setPosition(newCoordinate);
    });
    featureHTML.append(geometrySpan);

    $(content).append(featureHTML);
    overlay.setPosition(coordinate);
    window.coordinate = coordinate;
  });

  var lastFeature = null;
  selectInteraction.getFeatures().on('add', function(evt) {
    console.log('evt add', evt);
    //window.evt2 = evt;
    var feature = evt.element; //the feature selected
    lastFeature = feature;
  });

  window.map.addInteraction(selectInteraction);
  window.identifyInteraction = selectInteraction;
}

function searchFeaturesLayersByCoordinate(coordinate) {
  var featuresByLayer = new Array();
  for (i = 0; i < window.mapFeatureLayerObjects.length; i++) {
    var layer = window.mapFeatureLayerObjects[i];
    var type = layer.serviceType;
    //console.log(layer);
    if (type === 'WFS') {
      var layerId = mapFeatureLayerObjects[i].id;
      featuresByLayer.push({
        'layerId': layerId,
        'features': searchFeaturesLayerByCoordinate(layerId, coordinate)
      });
    }
  }
  return featuresByLayer;
}

// https://openlayers.org/en/latest/examples/jsts.html
function searchFeaturesLayerByCoordinate(layerId, coordinate) {
  //console.log(layerId);
  var layer = map.getLayer(layerId);
  var source = layer.getSource();
  var geometry = new ol.geom.Point(coordinate);
  var newGeometry = getBufferedInMap(geometry);
  consultas.addGeometryHighlight(newGeometry);
  return source.getFeaturesInExtent(newGeometry.getExtent());
  //return source.getFeaturesAtCoordinate(coordinate);
}

function getBufferedInMap(geometry) {
  // OJO puede cambiar por el dpi de la pantalla, hay que probar
  // https://gis.stackexchange.com/questions/242424/how-to-get-map-units-to-find-current-scale-in-openlayers
  function mapScale(dpi) {
    var unit = map.getView().getProjection().getUnits();
    var resolution = map.getView().getResolution();
    var inchesPerMetre = 39.37;

    return resolution * ol.proj.METERS_PER_UNIT[unit] * inchesPerMetre * dpi;
  }
  var meters = mapScale(0.2);
  console.log('mapScale meters', meters);
  // end
  var newGeometry = mapTools.bufferGeometry(geometry, meters);
  return newGeometry;
}

function addZoomSlider() {
  var zoomslider = new ol.control.ZoomSlider();
  map.addControl(zoomslider);
}

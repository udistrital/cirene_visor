var map;
var toolbar;
var esriConfig;
var servicios;
var grupoServicios;
var navToolbar;
var geometriaAnalisis;
var jstsParser;
var listOfNavigationsInteractions = new Array();
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

  var projection = new ol.proj.Projection({code: 'EPSG:4326', units: 'degrees', axisOrientation: 'neu'});

  var map = new ol.Map({
    //layers: [osmLayer, wmsLayer, grupoislaLayer, islaLayer],
    //overlays: [overlay],
    target: document.getElementById('map'),
    view: new ol.View({
      projection: projection,
      center: [
        -74.06567902549436, 4.6281822385875655
      ],
      // extent: [ //Esto limita el mapa a esta extension
      //   -74.18615000043059, 4.514284463291831, -73.92439112512187, 4.659751162274072
      // ],
      zoom: 18,
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
}

function zoomToInitialExtent() {
  setTimeout(function() {
    var initialExtent = map.getLayer('sede_punto').getSource().getExtent();
    map.getView().fit(initialExtent, map.getSize());
  }, 1000);
}

function addLayers() {
  // The URL referenced in the constructor may point to a style url JSON (as in this sample)
  // or directly to a vector tile service
  // NOT SUPPORT IN CHROME
  // var vtlayer = new VectorTileLayer('https://www.arcgis.com/sharing/rest/content/items/bf79e422e9454565ae0cbe9553cf6471/resources/styles/root.json')
  // map.addLayer(vtlayer)

  //configBufferTool()

  //map.on('load', createDrawToolbar)

  // https://developers.arcgis.com/javascript/3/jssamples/fl_ondemand.html
  //map.infoWindow.resize(400, 200)

  // Base map
  var osmLayer = new ol.layer.Tile({source: new ol.source.OSM()});

  map.addLayer(osmLayer);

  // format used to parse WFS GetFeature responses
  var geojsonFormat = new ol.format.GeoJSON();

  // var scalebar = new Scalebar({
  //     map: map,
  //     // 'dual' displays both miles and kilometers
  //     // 'english' is the default, which displays miles
  //     // use 'metric' for kilometers
  //     scalebarUnit: 'dual'
  // })

  window.mapFeatureLayerObjects = [];
  // map.on('zoom-end', function() {
  //     checkVisibilityAtScale()
  //     showScale()
  // })
  // showScale()

  var servicios = window.servicios;

  var wfsLoader = function(extent, resolution, projection) {
    var indice = this.indice;
    var wfsSource = this;
    var url = servicios[indice].url + //'/geoserver/parqueaderos/ows?service=WFS&' +
    //'version=1.0.0&request=GetFeature&typename=parqueaderos:isla&' +
    //'outputFormat=application%2Fjson' +
    '&srsname=EPSG:4326&bbox=' + extent.join(',') + ',EPSG:4326';
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

function showScale() {
  $('#extentpane>span').html('1:' + String(window.map.getScale()));
}

//https://geonet.esri.com/docs/DOC-8721-coded-domains-in-infotemplate
//https://developers.arcgis.com/javascript/3/jshelp/intro_formatinfowindow.html
function getSubtypeDomain(fieldVal, fieldName, feature, injectObject) {
  if (fieldVal === null) {
    return fieldVal;
  }

  var codedValues = servicios[injectObject.SERVICE_NUM].layers[injectObject.LAYER_NUM].fields[injectObject.FIELD_NUM].domain.codedValues;
  //console.log('codedValues', codedValues)
  for (var i in codedValues) {
    //console.log('codedValues[i], fieldVal', codedValues[i], fieldVal)
    if (codedValues[i].code === fieldVal) {
      return codedValues[i].name;
    }
  }
  //console.log('fieldVal, fieldName', fieldVal, fieldName, feature, injectObject)
  return 'Error.';
}

function generateTemplateContent(layer, SERVICE_NUM, LAYER_NUM) {
  var content = '';
  //console.log('layer', layer)
  //console.log(typeof(layer.fields), layer.fields.length)
  if (typeof(layer.fields) === 'undefined' || layer.fields.length === 0) {
    // var capa = map.getLayer(layer.id)
    // var fields = capa.fields
    // for (var i = 0; i < fields.length; i++) {
    //     var field = fields[i]
    //     //if(typeof(noFields) === "undefined" || noFields.indexof(field.alias) < 0 ){
    //       content += '<b>' + field.alias + ':<b> ${' + field.alias + '}'
    //     //}
    // }
  } else {
    for (var i = 0; i < layer.fields.length; i++) {
      var field = layer.fields[i];
      if (field.domain === undefined) {
        content += '<b>' + field.alias + ':</b> ${' + field.name + '} <br/>';
      } else {
        var codedValues = field.domain.codedValues;
        //var codedValue = codedValues[ Number(field.name) - 1 ]
        //console.log(codedValues, field.name, Number(field.name), Number(field.name) - 1, '<b>' + field.alias + ':</b> ${' + codedValue + ':getSubtypeDomain} <br/>')
        content += '<b>' + field.alias + ':</b> ${' + field.name + ':getSubtypeDomain(SERVICE_NUM: "' + SERVICE_NUM + '", LAYER_NUM: "' + LAYER_NUM + '" , FIELD_NUM: "' + i + '")} <br/>';
      }
    }
    //console.log('content', content)
  }
  return content;
}

function configBufferTool() {
  require([
    'esri/config', 'esri/tasks/GeometryService'
  ], function(esriConfig, GeometryService) {
    window.esriConfig = esriConfig;
    esriConfig.defaults.geometryService = new GeometryService('https://utility.arcgisonline.com/ArcGIS/rest/services/Geometry/GeometryServer');
    esriConfig.defaults.io.proxyUrl = '/arcgis/proxy.php';
    esriConfig.defaults.io.alwaysUseProxy = false;
  });
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

function createMeasurement() {
  // based on http://openlayers.org/en/latest/examples/measure.html
  var wgs84Sphere = new ol.Sphere(6378137);

  var source = new ol.source.Vector();

  /**
   * Currently drawn feature.
   * @type {ol.Feature}
   */
  var sketch;

  /**
   * The help tooltip element.
   * @type {Element}
   */
  var helpTooltipElement;

  /**
   * Overlay to show the help messages.
   * @type {ol.Overlay}
   */
  var helpTooltip;

  /**
   * The measure tooltip element.
   * @type {Element}
   */
  var measureTooltipElement;

  /**
   * Overlay to show the measurement.
   * @type {ol.Overlay}
   */
  var measureTooltip;

  /**
   * Message to show when the user is drawing a polygon.
   * @type {string}
   */
  var continuePolygonMsg = 'Click to continue drawing the polygon';

  /**
   * Message to show when the user is drawing a line.
   * @type {string}
   */
  var continueLineMsg = 'Click to continue drawing the line';

  /**
   * Handle pointer move.
   * @param {ol.MapBrowserEvent} evt The event.
   */
  var pointerMoveHandler = function(evt) {
    if (evt.dragging) {
      return;
    }
    /** @type {string} */
    var helpMsg = 'Click to start drawing';

    if (sketch) {
      var geom = (sketch.getGeometry());
      if (geom instanceof ol.geom.Polygon) {
        helpMsg = continuePolygonMsg;
      } else if (geom instanceof ol.geom.LineString) {
        helpMsg = continueLineMsg;
      }
    }

    helpTooltipElement.innerHTML = helpMsg;
    helpTooltip.setPosition(evt.coordinate);

    helpTooltipElement.classList.remove('hidden');
  };

  map.on('pointermove', pointerMoveHandler);

  map.getViewport().addEventListener('mouseout', function() {
    helpTooltipElement.classList.add('hidden');
  });

  var typeSelect = document.getElementById('type');
  var geodesicCheckbox = document.getElementById('geodesic');

  var draw; // global so we can remove it later

  /**
    * Format length output.
    * @param {ol.geom.LineString} line The line.
    * @return {string} The formatted length.
    */
  var formatLength = function(line) {
    var length;
    if (geodesicCheckbox.checked) {
      var coordinates = line.getCoordinates();
      length = 0;
      var sourceProj = map.getView().getProjection();
      for (var i = 0, ii = coordinates.length - 1; i < ii; ++i) {
        var c1 = ol.proj.transform(coordinates[i], sourceProj, 'EPSG:4326');
        var c2 = ol.proj.transform(coordinates[i + 1], sourceProj, 'EPSG:4326');
        length += wgs84Sphere.haversineDistance(c1, c2);
      }
    } else {
      length = Math.round(line.getLength() * 100) / 100;
    }
    var output;
    if (length > 100) {
      output = (Math.round(length / 1000 * 100) / 100) + ' ' + 'km';
    } else {
      output = (Math.round(length * 100) / 100) + ' ' + 'm';
    }
    return output;
  };

  /**
    * Format area output.
    * @param {ol.geom.Polygon} polygon The polygon.
    * @return {string} Formatted area.
    */
  var formatArea = function(polygon) {
    var area;
    if (geodesicCheckbox.checked) {
      var sourceProj = map.getView().getProjection();
      var geom =/** @type {ol.geom.Polygon} */
      (polygon.clone().transform(sourceProj, 'EPSG:4326'));
      var coordinates = geom.getLinearRing(0).getCoordinates();
      area = Math.abs(wgs84Sphere.geodesicArea(coordinates));
    } else {
      area = polygon.getArea();
    }
    var output;
    if (area > 10000) {
      output = (Math.round(area / 1000000 * 100) / 100) + ' ' + 'km<sup>2</sup>';
    } else {
      output = (Math.round(area * 100) / 100) + ' ' + 'm<sup>2</sup>';
    }
    return output;
  };

  function addInteraction() {
    var type = (typeSelect.value == 'area'
      ? 'Polygon'
      : 'LineString');
    draw = new ol.interaction.Draw({
      source: source, type:/** @type {ol.geom.GeometryType} */
      (type),
      style: new ol.style.Style({
        fill: new ol.style.Fill({color: 'rgba(255, 255, 255, 0.2)'}),
        stroke: new ol.style.Stroke({
          color: 'rgba(0, 0, 0, 0.5)',
          lineDash: [
            10, 10
          ],
          width: 2
        }),
        image: new ol.style.Circle({
          radius: 5,
          stroke: new ol.style.Stroke({color: 'rgba(0, 0, 0, 0.7)'}),
          fill: new ol.style.Fill({color: 'rgba(255, 255, 255, 0.2)'})
        })
      })
    });
    map.addInteraction(draw);

    createMeasureTooltip();
    createHelpTooltip();
    var listener;
    draw.on('drawstart', function(evt) {
      // set sketch
      sketch = evt.feature;

      /** @type {ol.Coordinate|undefined} */
      var tooltipCoord = evt.coordinate;

      listener = sketch.getGeometry().on('change', function(evt) {
        var geom = evt.target;
        var output;
        if (geom instanceof ol.geom.Polygon) {
          output = formatArea(geom);
          tooltipCoord = geom.getInteriorPoint().getCoordinates();
        } else if (geom instanceof ol.geom.LineString) {
          output = formatLength(geom);
          tooltipCoord = geom.getLastCoordinate();
        }
        measureTooltipElement.innerHTML = output;
        measureTooltip.setPosition(tooltipCoord);
      });
    }, this);

    draw.on('drawend', function() {
      measureTooltipElement.className = 'tooltip tooltip-static';
      measureTooltip.setOffset([0, -7]);
      // unset sketch
      sketch = null;
      // unset tooltip so that a new one can be created
      measureTooltipElement = null;
      createMeasureTooltip();
      ol.Observable.unByKey(listener);
    }, this);
  }

  /**
   * Creates a new help tooltip
   */
  function createHelpTooltip() {
    if (helpTooltipElement) {
      helpTooltipElement.parentNode.removeChild(helpTooltipElement);
    }
    helpTooltipElement = document.createElement('div');
    helpTooltipElement.className = 'tooltip hidden';
    helpTooltip = new ol.Overlay({
      element: helpTooltipElement,
      offset: [
        15, 0
      ],
      positioning: 'center-left'
    });
    map.addOverlay(helpTooltip);
  }

  /**
   * Creates a new measure tooltip
   */
  function createMeasureTooltip() {
    if (measureTooltipElement) {
      measureTooltipElement.parentNode.removeChild(measureTooltipElement);
    }
    measureTooltipElement = document.createElement('div');
    measureTooltipElement.className = 'tooltip tooltip-measure';
    measureTooltip = new ol.Overlay({
      element: measureTooltipElement,
      offset: [
        0, -15
      ],
      positioning: 'bottom-center'
    });
    map.addOverlay(measureTooltip);
  }

  /**
   * Let user change the geometry type.
   */
  typeSelect.onchange = function() {
    map.removeInteraction(draw);
    addInteraction();
  };

  addInteraction();
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

function createDrawToolbar(themap) {
  require([
    'esri/toolbars/draw', 'dojo/dom', 'dojo/on'
  ], function(Draw, dom, on) {
    window.toolbar = new Draw(map);
    toolbar.on('draw-end', addToMap);

    var boton,
      signal;

    boton = dom.byId('btnDrawPoint');
    signal = on(boton, 'click', function() {
      onClickButtonToolbar(signal, Draw, 'POINT');
    });
    boton = dom.byId('btnDrawLine');
    signal = on(boton, 'click', function() {
      onClickButtonToolbar(signal, Draw, 'POLYLINE');
    });
    boton = dom.byId('btnDrawPoly');
    signal = on(boton, 'click', function() {
      onClickButtonToolbar(signal, Draw, 'POLYGON');
    });
  });
}

function addToMap(evt) {
  require([
    'esri/graphic', 'esri/symbols/SimpleMarkerSymbol', 'esri/symbols/SimpleLineSymbol', 'esri/symbols/SimpleFillSymbol'
  ], function(Graphic, SimpleMarkerSymbol, SimpleLineSymbol, SimpleFillSymbol) {
    var symbol;
    toolbar.deactivate();
    map.showZoomSlider();
    var geometry = evt.geometry;
    switch (geometry.type) {
      case 'point':
      case 'multipoint':
        symbol = new SimpleMarkerSymbol();
        break;
      case 'polyline':
        symbol = new SimpleLineSymbol();
        break;
      default:
        symbol = new SimpleFillSymbol();
        break;
    }
    var graphic = new Graphic(geometry, symbol);
    map.graphics.add(graphic);
    window.currentGeometry = geometry;
    zoomToGeometry(window.currentGeometry);
  });
}

// Because this is such a useful idea, it is done automatically for Feature Layers hosted by ArcGIS online.
// function calcOffset() {
//     //https://developers.arcgis.com/javascript/3/jsapi/featurelayer.html#maxallowableoffset
//     console.log('map.extent.getWidth() / map.width', map.extent.getWidth() / map.width)
//     return (map.extent.getWidth() / map.width)
// }

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

function doBuffer(evtObj) {
  require([
    'esri/tasks/GeometryService',
    'esri/graphic',
    'esri/symbols/SimpleMarkerSymbol',
    'esri/symbols/SimpleLineSymbol',
    'esri/symbols/SimpleFillSymbol',
    'esri/Color',
    'esri/tasks/BufferParameters',
    'esri/geometry/normalizeUtils',
    'dojo/dom'
  ], function(GeometryService, Graphic, SimpleMarkerSymbol, SimpleLineSymbol, SimpleFillSymbol, Color, BufferParameters, normalizeUtils, dom) {
    //toolbar.deactivate()
    // valida parámetros
    var distance = dom.byId('buffer_distance').value;
    var unit = dom.byId('buffer_unit').value;
    if (distance === '') {
      displayMessage('Especifique una distancia de buffer.');
      return;
    }
    if (unit === '') {
      displayMessage('Especifique una unidad de buffer.');
      return;
    }

    var geometry = evtObj.geometry;
    var symbol;
    switch (geometry.type) {
      case 'point':
        symbol = new SimpleMarkerSymbol(SimpleMarkerSymbol.STYLE_SQUARE, 10, new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color([255, 0, 0]), 1), new Color([0, 255, 0, 0.25]));
        break;
      case 'polyline':
        symbol = new SimpleLineSymbol(SimpleLineSymbol.STYLE_DASH, new Color([255, 0, 0]), 1);
        break;
      case 'polygon':
        symbol = new SimpleFillSymbol(SimpleFillSymbol.STYLE_NONE, new SimpleLineSymbol(SimpleLineSymbol.STYLE_DASHDOT, new Color([255, 0, 0]), 2), new Color([255, 255, 0, 0.25]));
        break;
    }

    var graphic = new Graphic(geometry, symbol);
    map.graphics.add(graphic);

    //setup the buffer parameters
    var params = new BufferParameters();
    params.distances = [distance];
    params.outSpatialReference = map.spatialReference;
    params.unit = GeometryService[unit];
    //normalize the geometry

    normalizeUtils.normalizeCentralMeridian([geometry]).then(function(normalizedGeometries) {
      var normalizedGeometry = normalizedGeometries[0];
      if (normalizedGeometry.type === 'polygon') {
        //if geometry is a polygon then simplify polygon.  This will make the user drawn polygon topologically correct.
        esriConfig.defaults.geometryService.simplify([normalizedGeometry], function(geometries) {
          params.geometries = geometries;
          esriConfig.defaults.geometryService.buffer(params, showBuffer);
        });
      } else {
        params.geometries = [normalizedGeometry];
        esriConfig.defaults.geometryService.buffer(params, showBuffer);
      }
    });
  });
}

function showBuffer(bufferedGeometries) {
  require([
    'esri/graphic', 'esri/symbols/SimpleFillSymbol', 'esri/symbols/SimpleLineSymbol', 'esri/Color', 'dojo/_base/array'
  ], function(Graphic, SimpleFillSymbol, SimpleLineSymbol, Color, array) {
    var symbol = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID, new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color([255, 0, 0, 0.65]), 2), new Color([255, 0, 0, 0.35]));
    array.forEach(bufferedGeometries, function(geometry) {
      var graphic = new Graphic(geometry, symbol);
      map.graphics.add(graphic);
    });
    //OJO: solo se selecciona el primero porque es punto, linea o polígono unido
    window.currentGeometry = bufferedGeometries[0];
    zoomToGeometry(window.currentGeometry);
  });
}

function applyBuffer(evt) {
  if (!window.currentGeometry) {
    displayMessage('Por favor dibujer primero una geometría.');
  } else {
    doBuffer({geometry: window.currentGeometry});
  }
}

function displayMessage(msj) {
  $('#message-modal1').html(msj);
  $('#modal1').modal('open');
}

function changeNavpane(button, opt) {
  map.infoWindow.unsetMap();

  var btnFloatings = $('.btn-nav-pane');
  btnFloatings.each(function(index) {
    $(this).removeClass('red');
    $(this).addClass('teal');
  });

  button = $(button);
  button.removeClass('teal');
  button.addClass('red');

  // console.log('button', button)
  // if (button.hasClass('teal')) {
  //     button.removeClass('teal')
  //     button.addClass('red')
  // } else {
  //     button.removeClass('red')
  //     button.addClass('teal')
  // }

  var navpane = $('#navpane');
  if (navpane.css('display') === 'none') {
    navpane.css('display', 'block');
  } else {
    navpane.css('display', 'none');
    button.removeClass('red');
    button.addClass('teal');
    return;
  }

  var divs = $('#navpane > div');
  divs.each(function(index) {
    $(this).css('display', 'none');
  });
  var ele = $('#' + opt);
  if (opt === 'pane-medicion') {
    ele.css('display', 'block');
  }
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

    var geometrySpan = $('<span><a href="#">Acercar a</a></span>');
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

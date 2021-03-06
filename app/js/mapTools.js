(function() {

  var mapTools = {
    listOfNavigationsInteractions: [],
    eraseMeasurement: null,
    zoomToGeometry: function(geometry) {
      var geometryExtent = null;
      if (geometry.getType() === "Point") {
        geometryExtent = mapTools.bufferGeometry(geometry, 10).getExtent();
      } else {
        geometryExtent = geometry.getExtent();
      }
      window.getMap().getView().fit(geometryExtent, window.getMap().getSize());
    },
    changeFilter: function(element, layerId) {
      console.log('changeFilter', element, layerId);
      var layer = window.getMap().getLayer(layerId);
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
    changeMeasure: function(type) {
      console.log('changeMeasure type', type);
      if (mapTools.eraseMeasurement === null) {
        mapTools.turnOnMeasure(type);
      } else {
        mapTools.turnOffMeasure();
      }
    },
    turnOnMeasure: function(type) {
      mapTools.turnOffPopup();
      mapTools.panMap();
      if (mapTools.eraseMeasurement !== null) {
        mapTools.eraseMeasurement();
      }
      mapTools.createMeasurement(type);
    },
    turnOffMeasure: function() {
      if (mapTools.eraseMeasurement !== null) {
        mapTools.eraseMeasurement();
        mapTools.turnOnPopup();
      }
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
      var opt = (typeof options !== 'undefined') ?
        options : {};
      var layerFillColor = (typeof opt.fillColor !== 'undefined' && opt.fillColor !== '') ?
        opt.fillColor :
        'rgba(255, 255, 255, 0.1)';
      var layerStrokeColor = (typeof opt.strokeColor !== 'undefined' && opt.strokeColor !== '') ?
        opt.strokeColor :
        'rgba(255, 255, 255, 1.0)';
      var layerOpacity = (typeof opt.opacity === 'undefined') ?
        1 :
        opt.opacity;

      var image = null;
      if (typeof opt.iconImage !== 'undefined' && opt.iconImage !== '') {
        var imageURL = opt.iconImage;
        image = new ol.style.Icon( /** @type {olx.style.IconOptions} */
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
          fill: new ol.style.Fill({
            color: layerFillColor
          }),
          stroke: new ol.style.Stroke({
            color: layerStrokeColor,
            width: 1
          }),
          opacity: layerOpacity
        });
      }

      var styles = {
        'Point': new ol.style.Style({
          image: image
        }),
        'LineString': new ol.style.Style({
          stroke: new ol.style.Stroke({
            color: layerStrokeColor,
            width: 2
          }),
          opacity: layerOpacity
        }),
        'MultiLineString': new ol.style.Style({
          stroke: new ol.style.Stroke({
            color: layerStrokeColor,
            width: 2
          }),
          opacity: layerOpacity
        }),
        'MultiPoint': new ol.style.Style({
          image: image
        }),
        'MultiPolygon': new ol.style.Style({
          stroke: new ol.style.Stroke({
            color: layerStrokeColor,
            width: 2
          }),
          fill: new ol.style.Fill({
            color: layerFillColor
          }),
          opacity: layerOpacity
        }),
        'Polygon': new ol.style.Style({
          stroke: new ol.style.Stroke({
            color: layerStrokeColor,
            lineDash: [4],
            width: 3
          }),
          fill: new ol.style.Fill({
            color: layerFillColor
          }),
          opacity: layerOpacity
        }),
        'GeometryCollection': new ol.style.Style({
          stroke: new ol.style.Stroke({
            color: layerStrokeColor,
            width: 2
          }),
          fill: new ol.style.Fill({
            color: layerFillColor
          }),
          image: new ol.style.Circle({
            radius: 5,
            fill: null,
            stroke: new ol.style.Stroke({
              color: layerStrokeColor
            })
          }),
          opacity: layerOpacity
        }),
        'Circle': new ol.style.Style({
          stroke: new ol.style.Stroke({
            color: layerStrokeColor,
            width: 2
          }),
          fill: new ol.style.Fill({
            color: layerFillColor
          }),
          opacity: layerOpacity
        })
      };

      return styles[feature.getGeometry().getType()];
    },
    showResultFeatures: function(featuresByLayer) {
      var resultadosDiv = $('#resultadosDiv');
      resultadosDiv.html(''); // Clean results

      var accordion = '<ul class="collapsible" data-collapsible="expandable"></ul>';
      accordion = $(accordion);

      var hayResultados = false;
      var contentHTML = '';

      for (var i = 0; i < featuresByLayer.length; i++) {
        var layer = featuresByLayer[i];
        var layerObject = mapTools.getFeatureLayerObjectById(layer.layerId);
        var capaVisible = window.getMap().getLayer(layer.layerId).getVisible();
        if (capaVisible) {
          hayResultados = true;
          contentHTML = '';
          var features = layer.features;
          var item, header, body = null;
          if (features.length > 0) {
            item = $('<li class="active"></li>');
            header = $('<div class="collapsible-header active"><i class="material-icons tiny">play_arrow</i>' + layerObject.name + '</div>');
            body = $('<div class="collapsible-body"></div>');
            item.append(header);
            item.append(body);
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
              geometrySpan[0].geometry = properties.geometry;
              geometrySpan.click(function() {
                mapTools.cleanMap();
                mapTools.zoomToGeometry(this.geometry);
                consultas.addGeometryHighlight(this.geometry);
              });
              resultadoIdentificar.append(geometrySpan);
              body.append(resultadoIdentificar);
            }
          } else {
            contentHTML += '<div class="resultadoIdentificar"><span>No hay resultados.</span><div>';
            item = $('<li class="active"></li>');
            header = '<div class="collapsible-header active"><i class="material-icons tiny">play_arrow</i>' + layerObject.name + '</div>';
            body = '<div class="collapsible-body">' + contentHTML + '</div>';
          }
          accordion.append(item);
        }
      }

      if (hayResultados) { //no hubo resultados
        resultadosDiv.append(accordion);
      } else {
        contentHTML = '<h2>No hay capas activas.</h2>';
        resultadosDiv.append(contentHTML);
      }

      $('#resultadosDiv .collapsible').collapsible();

      window.sidebar.open('resultados');
    },
    getBufferedInMap: function(geometry) {
      // OJO puede cambiar por el dpi de la pantalla, hay que probar
      // https://gis.stackexchange.com/questions/242424/how-to-get-map-units-to-find-current-scale-in-openlayers
      function mapScale(dpi) {
        var unit = window.getMap().getView().getProjection().getUnits();
        var resolution = window.getMap().getView().getResolution();
        var inchesPerMetre = 39.37;

        return resolution * ol.proj.METERS_PER_UNIT[unit] * inchesPerMetre * dpi;
      }
      var meters = mapScale(0.2);
      console.log('mapScale meters', meters);
      // end
      var newGeometry = mapTools.bufferGeometry(geometry, meters);
      return newGeometry;
    },
    getFeatureLayerObjectById: function(id) {
      return window.getMapFeatureLayerObjects().find(function(featureLayerObject) {
        return featureLayerObject.id === id;
      });
    },
    searchFeaturesLayerByCoordinate: function(layerId, coordinate) {
      // https://openlayers.org/en/latest/examples/jsts.html
      //console.log(layerId);
      var layer = window.getMap().getLayer(layerId);
      var source = layer.getSource();
      var geometry = new ol.geom.Point(coordinate);
      var newGeometry = mapTools.getBufferedInMap(geometry);
      consultas.addGeometryHighlight(newGeometry);
      return source.getFeaturesInExtent(newGeometry.getExtent());
      //return source.getFeaturesAtCoordinate(coordinate);
    },
    searchFeaturesLayersByCoordinate: function(coordinate) {
      var featuresByLayer = [];
      var mapFeatureLayerObjects = window.getMapFeatureLayerObjects();
      for (var i = 0; i < mapFeatureLayerObjects.length; i++) {
        var layer = mapFeatureLayerObjects[i];
        var type = layer.serviceType;
        //console.log(layer);
        if (type === 'WFS') {
          var layerId = mapFeatureLayerObjects[i].id;
          featuresByLayer.push({
            'layerId': layerId,
            'features': mapTools.searchFeaturesLayerByCoordinate(layerId, coordinate)
          });
        }
      }
      return featuresByLayer;
    },
    identifyInLayers: function() {
      this.turnOffPopup();
      //consultas.cleanHighlight();
      $('#map').css('cursor', 'crosshair');
      var clkEvent = function(evt) {
        window.getMap().un('click', clkEvent);
        $('#map').css('cursor', 'default');
        $('#boton-resultados').removeClass('disabled');
        var coordinate = evt.coordinate;
        var featuresByLayer = mapTools.searchFeaturesLayersByCoordinate(coordinate);
        console.log('features', featuresByLayer);
        mapTools.showResultFeatures(featuresByLayer);
        // evt.stopPropagation();
        // evt.preventDefault();
        var handler = function() {
          if (window.getIdentifyInteraction().getMap() === null) {
            mapTools.turnOnPopup();
          } else {
            mapTools.turnOffPopup();
            setTimeout(handler, 100);
          }
        };
        setTimeout(handler, 1000);
      };
      window.getMap().on('click', clkEvent);
    },
    hideOverlays: function() {
      var overlays = window.getMap().getOverlays().getArray();
      for (var i = 0; i < overlays.length; i++) {
        overlays[i].setPosition(undefined);
      }
    },
    bufferGeometry: function(geometry, meters) {
      meters = (typeof meters !== 'undefined') ?
        meters :
        0;

      var sourceProj = window.getMap().getView().getProjection();
      var transformedGeometry = (geometry.clone().transform(sourceProj, 'EPSG:3857'));
      var jstsGeom = window.getJstsParser().read(transformedGeometry); //Only accept 3857
      console.log('jstsGeom', jstsGeom);
      // create a buffer of 1 meters around each line
      var buffered = jstsGeom.buffer(meters);

      // convert back from JSTS and replace the geometry on the feature
      var bufferedGeometry = window.getJstsParser().write(buffered);
      return bufferedGeometry.transform('EPSG:3857', sourceProj);
    },
    turnOffPopup: function() {
      window.getIdentifyInteraction().getFeatures().clear();
      this.hideOverlays();
      window.getMap().removeInteraction(window.getIdentifyInteraction());
    },
    turnOnPopup: function() {
      window.getMap().addInteraction(window.getIdentifyInteraction());
    },
    cleanMap: function() {
      window.getIdentifyInteraction().getFeatures().clear();
      this.hideOverlays();
      consultas.cleanHighlight();
    },
    cleanNavigationsInteractions: function() {
      var listOfNavigationsInteractions = mapTools.listOfNavigationsInteractions;
      for (var i = 0; i < listOfNavigationsInteractions.length; i++) {
        window.getMap().removeInteraction(listOfNavigationsInteractions[i]);
      }
      mapTools.listOfNavigationsInteractions = [];
      mapTools.turnOffMeasure();
    },
    zoomInBox: function() {
      this.cleanNavigationsInteractions();
      //http://openlayers.org/en/latest/apidoc/ol.events.condition.html
      var dragZoom = new ol.interaction.DragZoom({
        condition: ol.events.condition.mouseOnly,
        out: false
      });
      window.getMap().addInteraction(dragZoom);
      mapTools.listOfNavigationsInteractions.push(dragZoom);
    },
    zoomOutBox: function() {
      this.cleanNavigationsInteractions();
      //http://openlayers.org/en/latest/apidoc/ol.events.condition.html
      var dragZoom = new ol.interaction.DragZoom({
        condition: ol.events.condition.mouseOnly,
        out: true
      });
      window.getMap().addInteraction(dragZoom);
      mapTools.listOfNavigationsInteractions.push(dragZoom);
    },
    panMap: function() {
      this.cleanNavigationsInteractions();
      // var dragPan = new ol.interaction.DragPan();
      // map.addInteraction(dragPan);
      // listOfNavigationsInteractions.push(dragPan);
    },
    getCenterOfExtent: function(Extent) {
      var X = Extent[0] + (Extent[2] - Extent[0]) / 2;
      var Y = Extent[1] + (Extent[3] - Extent[1]) / 2;
      return [X, Y];
    },
    createMeasurement: function(type) {
      // based on http://openlayers.org/en/latest/examples/measure.html

      // emule select control
      // value may be set in some of ['length', 'area']
      var typeSelect = {
        value: type // linea o polígono
      };
      // [14:16, 17/7/2017] Andrés Mauricio Uribe: Una medición que se hace con técnicas de geodesia
      // [14:16, 17/7/2017] Andrés Mauricio Uribe: Mayor precisión
      // emule checkbox control
      var geodesicCheckbox = {
        'checked': true
      };

      var wgs84Sphere = new ol.Sphere(6378137);

      var source = new ol.source.Vector();

      var vector = new ol.layer.Vector({
        source: source,
        style: new ol.style.Style({
          fill: new ol.style.Fill({
            color: 'rgba(255, 255, 255, 0.2)'
          }),
          stroke: new ol.style.Stroke({
            color: '#ffcc33',
            width: 2
          }),
          image: new ol.style.Circle({
            radius: 7,
            fill: new ol.style.Fill({
              color: '#ffcc33'
            })
          })
        })
      });

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
      var measureTooltipArray = [];

      /**
       * Message to show when the user is drawing a polygon.
       * @type {string}
       */
      var continuePolygonMsg = 'Clic para continuar dibujando el polígono,<br /> doble clic para terminar.';

      /**
       * Message to show when the user is drawing a line.
       * @type {string}
       */
      var continueLineMsg = 'Clic para continuar dibujando la línea,<br/> doble clic para terminar.';

      /**
       * Handle pointer move.
       * @param {ol.MapBrowserEvent} evt The event.
       */
      var pointerMoveHandler = function(evt) {
        if (evt.dragging) {
          return;
        }
        /** @type {string} */
        var helpMsg = 'Clic para comenzar a dibujar.';

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

      window.getMap().addLayer(vector);

      window.getMap().on('pointermove', pointerMoveHandler);

      window.getMap().getViewport().addEventListener('mouseout', function() {
        helpTooltipElement.classList.add('hidden');
      });

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
          var sourceProj = window.getMap().getView().getProjection();
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
          var sourceProj = window.getMap().getView().getProjection();
          var geom = /** @type {ol.geom.Polygon} */
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
        var type = (typeSelect.value === 'area' ?
          'Polygon' :
          'LineString');
        draw = new ol.interaction.Draw({
          source: source,
          type: /** @type {ol.geom.GeometryType} */
            (type),
          style: new ol.style.Style({
            fill: new ol.style.Fill({
              color: 'rgba(255, 255, 255, 0.2)'
            }),
            stroke: new ol.style.Stroke({
              color: 'rgba(0, 0, 0, 0.5)',
              lineDash: [
                10, 10
              ],
              width: 2
            }),
            image: new ol.style.Circle({
              radius: 5,
              stroke: new ol.style.Stroke({
                color: 'rgba(0, 0, 0, 0.7)'
              }),
              fill: new ol.style.Fill({
                color: 'rgba(255, 255, 255, 0.2)'
              })
            })
          })
        });
        window.getMap().addInteraction(draw);

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
          window.getMap().addOverlay(measureTooltip);
          measureTooltipArray.push(measureTooltip);
        }


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

        createMeasureTooltip();
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
        window.getMap().addOverlay(helpTooltip);
      }

      /**
       * Let user change the geometry type.
       */
      typeSelect.onchange = function() {
        window.getMap().removeInteraction(draw);
        addInteraction();
      };
      createHelpTooltip();
      addInteraction();

      function eraseMeasurement() {
        window.getMap().removeInteraction(draw);
        window.getMap().removeLayer(vector);
        for (var i = 0; i < measureTooltipArray.length; i++) {
          window.getMap().removeOverlay(measureTooltipArray[i]);
        }
        window.getMap().removeOverlay(helpTooltip);
        mapTools.eraseMeasurement = null;
      }

      mapTools.eraseMeasurement = eraseMeasurement; // expose erase function
    }
  };

  if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    console.log('Load module for Node.js');
    module.exports = mapTools;
  } else {
    window.mapTools = mapTools;
  }

})();

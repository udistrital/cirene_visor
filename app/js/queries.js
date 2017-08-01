window.consultas = {
  addLayerHighlight: function(map) {
    var source = new ol.source.Vector();
    source.config = {
      'id': 'highlight'
    }
    var featureOverlay = new ol.layer.Vector({
      source: source,
      style: function(feature) {
        var opt = {
          'fillColor': 'rgba(255, 255, 255, 0.5)',
          'strokeColor': '#0099ff',
          'opacity': '1',
          'iconImage': ''
        }
        return mapTools.getLayerStyle(feature, opt);
      }
    });
    map.addLayer(featureOverlay);
  },
  addGeometryHighlight: function(geometry) {
    var feature = new ol.Feature({geometry: geometry, name: 'Geometría resaltada.'});
    this.addFeatureHighlight(feature);
  },
  addFeatureHighlight: function(feature) {
    var featureOverlay = window.map.getLayer('highlight');
    var source = featureOverlay.getSource();
    var features = source.getFeatures();
    source.clear();
    source.addFeature(feature);
    var clkEvent = function(evt) {
      map.un('click', clkEvent);
      consultas.cleanHighlight();
    }
    map.on('click', clkEvent);
  },
  cleanHighlight: function() {
    var featureOverlay = window.map.getLayer('highlight');
    featureOverlay.getSource().clear();
  }
}

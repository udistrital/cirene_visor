window.consultas = {
  addLayerHighlight: function() {
    var source = new ol.source.Vector();
    source.config = {
      'id': 'highlight'
    }
    var featureOverlay = new ol.layer.Vector({
      source: source,
      style: function(feature) {
        var opt = {
          'fillColor': 'rgba(40, 187, 21, 0.45)',
          'strokeColor': 'rgb(0, 119, 255)',
          'opacity': '1',
          'iconImage': ''
        }
        return mapTools.getLayerStyle(feature, opt);
      }
    });
    window.map.addLayer(featureOverlay);
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

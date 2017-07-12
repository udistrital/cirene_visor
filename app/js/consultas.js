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
          'fillColor': 'rgb(40, 187, 21)',
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
    var feature = new ol.Feature({geometry: geometry, name: 'New Feature'});
    this.addFeatureHighlight(feature);
  },
  addFeatureHighlight: function(feature) {
    var featureOverlay = window.map.getLayer('highlight');
    var source = featureOverlay.getSource();
    var features = source.getFeatures();
    for (var i = 0; i < features.length; i++) {
      source.removeFeature(features[i]);
    }
    source.addFeature(feature);
  }
}

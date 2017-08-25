describe("Validar mapTools.js", function() {
  it("Se prueban funciones internas.", (function() {
    var result = undefined;
    expect(result).toBe(undefined);

    // var result = this.listOfNavigationsInteractions;
    // expect(result).toBe();
    //
    // var result = this.eraseMeasurement();
    // expect(result).toBe(undefined);
    //
    // var result = this.zoomToGeometry(geometry);
    // expect(result).toBe(undefined);
    //
    // var result = this.changeFilter(element, layerId);
    // expect(result).toBe(undefined);
    //
    // var result = this.changeMeasure(type);
    // expect(result).toBe(undefined);
    //
    // var result = this.turnOnMeasure(type);
    // expect(result).toBe(undefined);
    //
    // var result = this.turnOffMeasure();
    // expect(result).toBe(undefined);
    //
    // var result = this.searchLayerRecursive(layers, listenFunction);
    // expect(result).toBe(undefined);
    //
    // var result = this.getLayerStyle(feature, options);
    // expect(result).toBe(undefined);
    //
    // var result = this.showResultFeatures(featuresByLayer);
    // expect(result).toBe(undefined);
    //
    // var result = this.getBufferedInMap(geometry);
    // expect(result).toBe(undefined);
    //
    // var result = this.getFeatureLayerObjectById(id);
    // expect(result).toBe(undefined);
    //
    // var result = this.searchFeaturesLayerByCoordinate(layerId, coordinate);
    // expect(result).toBe(undefined);
    //
    // var result = this.searchFeaturesLayersByCoordinate(coordinate);
    // expect(result).toBe(undefined);
    //
    // var result = this.identifyInLayers();
    // expect(result).toBe(undefined);
    //
    // var result = this.hideOverlays();
    // expect(result).toBe(undefined);
    //
    // var result = this.bufferGeometry(geomtry, meters);
    // expect(result).toBe(undefined);
    //
    // var result = this.turnOffPopup();
    // expect(result).toBe(undefined);
    //
    // var result = this.turnOnPopup();
    // expect(result).toBe(undefined);
    //
    // var result = this.cleanMap();
    // expect(result).toBe(undefined);
    //
    // var result = this.cleanNavigationsInteractions();
    // expect(result).toBe(undefined);
    //
    // var result = this.zoomInBox();
    // expect(result).toBe(undefined);
    //
    // var result = this.zoomOutBox();
    // expect(result).toBe(undefined);
    //
    // var result = this.panMap();
    // expect(result).toBe(undefined);
    //
    // var result = this.getCenterOfExtent();
    // expect(result).toBe(undefined);
    //
    // var result = this.createMeasurement();
    // expect(result).toBe(undefined);

  }).bind(window.mapTools));

  it("Se prueban funciones globales de window.", (function() {

    var result = undefined;
    expect(result).toBe(undefined);

  }).bind(window.mapTools));

});

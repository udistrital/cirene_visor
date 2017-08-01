var loadTest = function (){
  console.log('map', window.map, typeof window.map, setTimeout);
  if (typeof window.map === 'undefined'){
    console.log('hiii');
    setTimeout(function () {
      console.log('hiii2');
      loadTest();
    }, 1000);
    return;
  }
  describe("Validar CreateMap", function() {
    it("tipo del mapa", function() {
      // Valida por lo menos la sintaxis.
      console.log('map', map);
      var mapType = typeof map;
      expect(mapType).toBe('object');
    });
  });
};

loadTest();

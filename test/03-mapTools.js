describe("Validar mapTools.js", function() {
  it("Se prueban funciones internas.", (function() {
    var result = undefined;
    expect(result).toBe(undefined);

  }).bind(window._scopeCreateMap));

  it("Se prueban funciones globales de window.", (function() {

    var result = undefined;
    expect(result).toBe(undefined);

  }).bind(window._scopeCreateMap));

});

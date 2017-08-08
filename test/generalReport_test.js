describe("Validar generalReport.js", function() {
  it("Se prueban funciones internas.", (function() {
    var result = undefined;
    expect(result).toBe(undefined);

  }).bind(window._scopeGeneralReport));

  it("Se prueban funciones globales de window.", (function() {

    var result = undefined;
    expect(result).toBe(undefined);

  }).bind(window._scopeGeneralReport));

});

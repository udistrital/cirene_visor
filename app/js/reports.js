(function() {
  var reportes = null;
  var chartColors = null;
  var randomScalingFactor = null;
  var lastCharData = null;
  var myPieConfig = null;
  var myPie = null;
  var addChartDataToMap = null;
  var removeChartOfMap = null;

  var loadData = function() {};
  var cargarDatos = function() {};
  var autenticar = function() {};
  var graficarPie = function() {};
  var getReportes = function() {};
  var exposeGlobals = function() {};


  $(function() {
    console.log("Ready reports!");
    loadData();
  });

  loadData = function() {
    var reportesPromise = $.get('conf/reportes.json');

    $.when(reportesPromise).done(function(results) {
      // do something
      console.log('results reportes', results);
      reportes = results;

      autenticar(reportes[0]); // OJO temporal
    });
  };

  chartColors = {
    red: 'rgb(255, 99, 132)',
    orange: 'rgb(255, 159, 64)',
    yellow: 'rgb(255, 205, 86)',
    green: 'rgb(75, 192, 192)',
    blue: 'rgb(54, 162, 235)',
    purple: 'rgb(153, 102, 255)',
    grey: 'rgb(201, 203, 207)',
    pink: 'rgb(255,102,204)',
    brown: 'rgb(139,69,19)',
    cyan: 'rgb(0,255,255)',
    magenta: 'rgb(255,0,255)'
  };


  randomScalingFactor = function() {
    return Math.round(Math.random() * 100);
  };

  graficarPie = function(response) {
    //var url = require('file-loader!./pie.json');
    // var url = 'https://ide.proadmintierra.info/odk/' + value;
    // console.log(url);
    // $.ajax({url: url}).done(function(response) {
    //console.log('response', response);

    var data = [];
    var labels = [];
    var colorlist = [
      chartColors.red,
      chartColors.green,
      chartColors.orange,
      chartColors.blue,
      chartColors.yellow,
      chartColors.purple,
      chartColors.grey,
      chartColors.pink,
      chartColors.magenta,
      chartColors.cyan,
      chartColors.brown
    ];

    for (var i = 0; i < response.length; i++) {
      response[i].color = colorlist[i];
      var alias = response[i].alias;
      var numPredios = response[i].predios.length;
      labels.push(alias);
      data.push(numPredios);
    }

    lastCharData = response;

    if (myPieConfig !== null) {
      myPieConfig.data.datasets.splice(0, 1); //Se elimina el anterior
      var newDataset = {
        backgroundColor: colorlist,
        data: data,
        label: 'Gráfica'
      };
      var newLabel = labels;
      myPieConfig.data.datasets.push(newDataset);
      myPieConfig.data.labels = newLabel;
      myPie.update();
      return;
    }

    myPieConfig = {
      type: 'pie',
      data: {
        datasets: [{
          data: data,
          backgroundColor: colorlist,
          label: 'Gráfica'
        }],
        labels: labels
      },
      options: {
        responsive: true,
        legend: {
          position: 'bottom'
        },
        tooltips: {
          callbacks: {
            label: function(tooltipItem, data) {
              var label = data.labels[tooltipItem.index];
              var dataset = data.datasets[tooltipItem.datasetIndex];
              var value = dataset.data[tooltipItem.index];
              var total = dataset.data.reduce(function(previousValue, currentValue, currentIndex, array) {
                return previousValue + currentValue;
              });
              var currentValue = dataset.data[tooltipItem.index];
              var precentage = Math.floor(((currentValue / total) * 100) + 0.5);
              return label + ': ' + value + ' Espacios ' + precentage + '%';
            }
          }
        }
      }
    };

    var ctx = document.getElementById('chart-area').getContext('2d');
    myPie = new Chart(ctx, myPieConfig);
  };

  cargarDatos = function(report, cookie) {
    // Please see REST controller for more options
    // https://github.com/SpagoBILabs/SpagoBI/blob/SpagoBI-5.1/SpagoBIProject/src/it/eng/spagobi/api/DataSetResource.java

    var url = report.restUrl;
    console.log('cargarDatos url', url);

    var parameters = {
      facultad: 33,
      semestre: 1,
      anno: 2015
    };
    parameters = window.escape(JSON.stringify(parameters));
    url = url + '?parameters=' + parameters;

    var selections = {
      "DSEspFis": {}
    };
    selections = window.escape(JSON.stringify(selections));
    url = url + '&selections=' + selections;

    var headers = 'Cookie:' + cookie;
    url = '/proxy?headers=' + window.escape(headers) + '&url=' + window.escape(url);

    $.ajax({
      url: url,
      method: 'GET',
      dataType: 'json'
    }).done(function(spagoBIresponse) {
      console.log('second success');
      //mostarEnTabla(result);
      var fields = spagoBIresponse.metaData.fields;
      // for (var i = 0; i < fields.length; i++) {
      //   var field = fields[i];
      //   var fieldName = (typeof field.header != 'undefined') ? field.header : field;
      // }
      var rows = spagoBIresponse.rows;
      var elements = {};
      var labels = {};
      for (var i = 0; i < rows.length; i++) {
        var row = rows[i];
        var columnValue = row.column_25; // codigo_espacio_fisico
        // console.log('columnValue', columnValue, row);
        // var categoryValue = row.column_2; // codigo_facultad
        // var categoryName = row.column_3; // facultad
        var categoryValue = row.column_10; // codigo_facultad
        var categoryName = row.column_10; // facultad
        labels[categoryValue] = categoryName;
        if (typeof elements[categoryValue] === 'undefined') {
          elements[categoryValue] = [];
        }
        elements[categoryValue].push(columnValue);
      }

      console.log('cargarDatos elements', elements);

      var response = [];

      for (var key in elements) {
        if (elements.hasOwnProperty(key)) {
          response.push({
            'nombre': key,
            'alias': labels[key],
            'predios': elements[key]
          });
        }
      }

      console.log('cargarDatos elements', response);
      // var response = [
      //   {
      //     'nombre': 'femenino',
      //     'alias': 'Género Femenino',
      //     'predios': ['034234', '234234', '334234', '734234']
      //   }, {
      //     'nombre': 'masculino',
      //     'alias': 'Género Masculino',
      //     'predios': ['034334', '22234', '334774', '730000']
      //   }, {
      //     'nombre': 'desconocido',
      //     'alias': 'No Disponible',
      //     'predios': ['0332224', '2232323', '3334723', '7333300']
      //   }
      // ];
      graficarPie(response);
    }).fail(function(e) {
      console.log('error', e);
    }).always(function() {
      console.log('complete');
    });
  };

  autenticar = function(report) {
    var _dc = new Date().getTime();
    var url = report.authUrl;
    //url = 'http://sig.udistrital.edu.co/proxy?url=' + escape(url);
    url = '/proxy?url=' + window.escape(url) + '&renameheaders';
    console.log('autenticar url', url);

    $.ajax({
      type: 'GET',
      url: url,
      beforeSend: function(xhr) {
        //xhr.setRequestHeader('Cookie', '');
      },
      success: function(output, status, xhr) {
        //console.log('success', output, status, xhr);
        console.log('coookie', xhr.getResponseHeader('_Set-Cookie'));
        var setCookie = xhr.getResponseHeader('_Set-Cookie');
        cargarDatos(report, setCookie);
      },
      error: function(err) {
        console.log('error', err);
      }
    }).always(function() {
      console.log('complete');
    });

  };


  //poligono styles
  function styleFunction(feature, lastCharData) {
    var codPredial = feature.get('Código').toString();
    var grupoDatos = lastCharData.find(function(element) {
      return element.predios.indexOf(codPredial) > -1;
    });

    if (typeof grupoDatos === 'undefined') {
      return null;
    }
    var colorStroke = grupoDatos.color;
    var colorFill = Color(colorStroke);
    colorFill.alpha(0.2);
    colorFill = colorFill.rgbaString();

    var image = new ol.style.Circle({
      radius: 5,
      fill: new ol.style.Fill({
        color: 'rgba(223, 62, 62, 1)'
      }),
      stroke: new ol.style.Stroke({
        color: 'rgba(116, 43, 8, 0.45)',
        width: 1
      })
    });

    var styles = {
      'Point': new ol.style.Style({
        image: image
      }),
      'LineString': new ol.style.Style({
        stroke: new ol.style.Stroke({
          color: 'green',
          width: 1
        })
      }),
      'MultiLineString': new ol.style.Style({
        stroke: new ol.style.Stroke({
          color: 'green',
          width: 1
        })
      }),
      'MultiPoint': new ol.style.Style({
        image: image
      }),
      'MultiPolygon': new ol.style.Style({
        stroke: new ol.style.Stroke({
          color: colorStroke,
          width: 1
        }),
        fill: new ol.style.Fill({
          color: colorFill
        })
      }),
      'Polygon': new ol.style.Style({
        stroke: new ol.style.Stroke({
          color: colorStroke,
          lineDash: [4],
          width: 3
        }),
        fill: new ol.style.Fill({
          color: colorFill
        })
      }),
      'GeometryCollection': new ol.style.Style({
        stroke: new ol.style.Stroke({
          color: 'magenta',
          width: 2
        }),
        fill: new ol.style.Fill({
          color: 'magenta'
        }),
        image: new ol.style.Circle({
          radius: 10,
          fill: null,
          stroke: new ol.style.Stroke({
            color: 'magenta'
          })
        })
      }),
      'Circle': new ol.style.Style({
        stroke: new ol.style.Stroke({
          color: 'red',
          width: 2
        }),
        fill: new ol.style.Fill({
          color: 'rgb(255,0,0)'
        })
      })
    };

    console.log('hi', feature.getGeometry().getType(), styles[feature.getGeometry().getType()]);

    return styles[feature.getGeometry().getType()];
  }

  function createLayer(filter, lastCharData) {
    var configLayer = {
      id: 'piloto-filtrado',
      filter: filter
    };
    window.getMap().removeLayer(window.getMap().getLayer(configLayer.id));

    var geojsonFormat = new ol.format.GeoJSON();
    var wfsLoader = function(extent, resolution, projection) {
      // var newExtent = window.getMap().getView().calculateExtent(window.getMap().getSize());
      // extent = newExtent;
      var indice = this.indice;
      var wfsSource = this;
      var url = '/geoserver/SIGUD/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=SIGUD:vista_espacios&outputFormat=application%2Fjson' + //'/geoserver/parqueaderos/ows?service=WFS&' +
        //'version=1.0.0&request=GetFeature&typename=parqueaderos:isla&' +
        //'outputFormat=application%2Fjson' +
        '&srsname=EPSG:3857&bbox=' + extent.join(',') + ',EPSG:3857';
      // use jsonp: false to prevent jQuery from adding the "callback"
      // parameter to the URL
      $.ajax({
        url: url,
        dataType: 'json',
        jsonp: false
      }).done(function(response) {
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

    var serviceSource = new ol.source.Vector({
      loader: wfsLoader,
      strategy: ol.loadingstrategy.tile(ol.tilegrid.createXYZ({
        maxZoom: 19
      }))
    });

    serviceSource.config = configLayer;

    var serviceLayer = new ol.layer.Vector({
      source: serviceSource,
      style: function(feature) {
        return styleFunction(feature, lastCharData);
      }
    });

    return serviceLayer;
  }

  addChartDataToMap = function() {
    var layer = createLayer(true, lastCharData);
    window.getMap().addLayer(layer);
  };

  removeChartOfMap = function() {
    window.getMap().removeLayer(window.getMap().getLayer('piloto-filtrado'));
  };

  getReportes = function() {
    return reportes;
  };

  exposeGlobals = function() {
    window.reports = {
      addChartDataToMap: addChartDataToMap,
      removeChartOfMap: removeChartOfMap,
      autenticar: autenticar,
      getReportes: getReportes
    };
  };

  if (typeof window !== 'undefined') {
    exposeGlobals();
  }
})();

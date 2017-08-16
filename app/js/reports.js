(function() {
  var reports = null;
  var chartColors = null;
  var lastChartData = null;
  var lastReport = null;
  var lastCookie = null;
  var lastSpagoBIresponse = null;
  var myPieConfig = null;
  var myPie = null;
  var REPORTLAYERID = '_reportsLayer';

  var loadSelectReports = function() {};
  var graphPie = function() {};
  var loadJSONData = function() {};
  var searchDatasetFieldsByColumn = function() {};
  var paintParameters = function() {};
  var chartByCriteria = function() {};
  var loadingIcon = function() {};
  var addListCriteria = function() {};
  var addMapFilter = function() {};
  var loadRESTData = function() {};
  var loadFormData = function() {};
  var queryDatasetData = function() {};
  var authenticate = function() {};
  var changeSelectChart = function() {};
  var styleFunction = function() {};
  var createLayer = function() {};
  var addChartDataToMap = function() {};
  var removeChartOfMap = function() {};
  var getReports = function() {};
  var getReportById = function() {};
  var openSpagobiLinkReport = function() {};
  var exposeGlobals = function() {};

  $(function() {
    console.log("Ready reports.js!");
    loadJSONData();
  });

  loadSelectReports = function(reports) {
    var container = $('#select-chart');
    var select = $('<select id="select-chart-select" onchange="reports.changeSelectChart(event);"></select>');
    var option = $('<option value="" disabled selected>Seleccione una gráfica.</option>');
    select.append(option);

    var rows = reports;
    for (var i = 0; i < rows.length; i++) {
      var row = rows[i];
      if (typeof row.enable !== 'undefined' && row.enable !== '' && row.enable !== false) {
        var name = row.name;
        var value = row.id;
        option = $('<option value="' + value + '">' + name + '</option>');
        select.append(option);
      }
    }

    container.append(select);
    $(container).find('select').material_select();
  };

  /**
   * Llama los reportes de un archivo JSON.
   */
  loadJSONData = function() {
    var reportsPromise = $.get('conf/reportes.json');

    $.when(reportsPromise).done(function(results) {
      // do something
      console.log('results reports', results);
      reports = results;
      loadSelectReports(reports);
      //authenticate(reports[0]); // OJO temporal
    });
  };

  /**
   * Contiene la lista de Colores
   */
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

  /**
   * Llama los reportes de un archivo JSON.
   * @constructor
   * @param {array} response - Un arreglo de items a graficar
   var response = [
     {
       'nombre': 'femenino',
       'alias': 'Género Femenino',
       'predios': ['034234', '234234', '334234', '734234']
     }, {
       'nombre': 'masculino',
       'alias': 'Género Masculino',
       'predios': ['034334', '22234', '334774', '730000']
     }, {
       'nombre': 'desconocido',
       'alias': 'No Disponible',
       'predios': ['0332224', '2232323', '3334723', '7333300']
     }
   ];
   */
  graphPie = function(response) {
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

    var newColorList = [];

    var j = 0;
    for (var i = 0; i < response.length; i++) {
      newColorList.push(colorlist[j]);
      j = (j >= colorlist.length) ?
        0 :
        j + 1;
      // Se agrega color para ponerlo luego en la geometria del mapa
      response[i].color = colorlist[j];
      var alias = response[i].alias;
      var numPredios = response[i].predios.length;
      labels.push(alias);
      data.push(numPredios);
    }
    console.log('color', newColorList, data, labels);

    lastChartData = response;

    if (myPieConfig !== null) {
      myPieConfig.data.datasets.splice(0, 1); //Se elimina el anterior
      var newDataset = {
        backgroundColor: newColorList,
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
          backgroundColor: newColorList,
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

  searchDatasetFieldsByColumn = function(dataSetFields, datasetColumn) {
    return dataSetFields.find(function(field) {
      var columnName = field.header;
      return columnName === datasetColumn;
    }).dataIndex;
  };

  paintParameters = function(response, ctxParameter) {
    var indice = ctxParameter.indice;
    // Se obtiene el contenedor en la posicion esperada para poner el select
    var container = $('#form-chart div:nth-child(' + (indice + 1) + ')');
    //var div = $('<div class="input-field col s12"></div>');//ya deberia existir
    var id = 'form-chart-' + ctxParameter.id;
    var select = $('<select id="' + id + '"></select>');
    var option = $('<option value="" disabled selected>Seleccione</option>');
    select.append(option);

    var rows = response.rows;
    var fields = response.metaData.fields;
    // el nombre de la columna que contiene el name a poner en el option
    var datasetColumnName = ctxParameter.parameter.datasetColumnName;
    var columnName = searchDatasetFieldsByColumn(fields, datasetColumnName);
    // el nombre de la columna que contiene el valor a poner en el option
    var datasetColumnValue = ctxParameter.parameter.datasetColumnValue;
    var columnValue = searchDatasetFieldsByColumn(fields, datasetColumnValue);

    for (var i = 0; i < rows.length; i++) {
      var row = rows[i];
      var name = row[columnName];
      var value = row[columnValue];
      option = $('<option value="' + value + '">' + name + '</option>');
      select.append(option);
    }
    var selectName = ctxParameter.parameter.name;
    var label = $('<label>' + selectName + '</label>');
    container.append(select);
    container.append(label);
    $(container).find('select').material_select();
  };

  loadFormData = function(report, cookie) {
    loadingIcon(true, 'Consultando...');
    var container = $('#form-chart');
    container.html(''); // Clean container

    lastReport = report;
    lastCookie = cookie;

    var parameters = report.query.parameters;
    var indice = 0;
    for (var iParameter in parameters) {
      // Se crean los contenedores en espera de los resultados;
      var div = $('<div class="input-field col s12"></div>');
      container.append(div);
      if (parameters.hasOwnProperty(iParameter)) {
        console.log('loadFormData iParameter', iParameter);
        var parameter = parameters[iParameter];
        var url = parameter.datasetUrl;
        var headers = 'Cookie:' + cookie;
        url = '/proxy?headers=' + window.escape(headers) + '&url=' + window.escape(url);
        $.ajax({
          url: url,
          method: 'GET',
          dataType: 'json'
        }).done((function(response) {
          var ctxParameter = this;
          console.log('loadFormData done', response, ctxParameter);
          paintParameters(response, ctxParameter);
          loadingIcon(false, 'Terminado...');
        }).bind({
          id: iParameter,
          indice: indice,
          parameter: parameter
        })).fail(function(e) {
          console.log('loadFormData error', e);
          loadingIcon(false, 'Error...');
        });
        indice += 1;
      }
    }
  };

  chartByCriteria = function() {
    var category = $('#category-field').val();
    if (category === null || category === '') {
      generalReport.displayMessage('Seleccione una categoría.');
      return;
    }
    //mostarEnTabla(result);
    var report = lastReport;
    var spagoBIresponse = lastSpagoBIresponse;
    var fields = spagoBIresponse.metaData.fields;
    var rows = spagoBIresponse.rows;
    if (rows.length === 0) {
      generalReport.displayMessage('No hay resultados para graficar.');
    }
    var elements = {};
    var labels = {};
    for (var i = 0; i < rows.length; i++) {
      var row = rows[i];
      var datasetColumnName = report.datasetColumn;
      // busca el column_# correspondiente a ese nombre de columna
      var columnName = searchDatasetFieldsByColumn(fields, datasetColumnName);
      //console.log('columnName', columnName, 'category', category, 'datasetColumnName', datasetColumnName);
      var columnValue = row[columnName]; // codigo_espacio_fisico
      // console.log('row[category]', row[category], row, category);
      var categoryValue = generalReport.normalize(row[category]); // codigo_facultad
      var categoryName = row[category]; // facultad
      labels[categoryValue] = categoryName;
      if (typeof elements[categoryValue] === 'undefined') {
        elements[categoryValue] = [];
      }
      elements[categoryValue].push(columnValue);
    }

    console.log('chartByCriteria elements', elements);

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

    console.log('chartByCriteria response', response);
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
    graphPie(response);
  };

  loadingIcon = function(activate, message) {
    document.getElementById('loading-reports-message').innerHTML = message;
    setTimeout(function() {
      if (activate) {
        document.getElementById('loading-reports').style.display = 'block';
      } else {
        document.getElementById('loading-reports').style.display = 'none';
      }
    }, 200);
  };

  addListCriteria = function(report, spagoBIresponse) {
    var container = $('#criteria-chart');
    container.html('');

    if (spagoBIresponse.results === 0) {
      generalReport.displayMessage('No hay resultados para esta consulta.');
    }

    var div = $('<div class="input-field col s12"></div>');
    var select = $('<select id="category-field" onchange="reports.chartByCriteria();"></select>');
    var option = $('<option value="" disabled selected>Seleccione</option>');
    select.append(option);
    var listCriteria = report.listCriteria;
    var fields = spagoBIresponse.metaData.fields;
    if (typeof listCriteria !== 'undefined' && listCriteria !== '' && typeof listCriteria.length !== 'undefined') {
      for (var i = 0; i < listCriteria.length; i++) {
        var criteria = listCriteria[i];
        var datasetColumnName = criteria.field;
        var fieldValue = searchDatasetFieldsByColumn(fields, datasetColumnName);
        var fieldName = criteria.name;
        option = $('<option value="' + fieldValue + '">' + fieldName + '</option>');
        select.append(option);
      }
    } else {
      var fields = spagoBIresponse.metaData.fields;
      for (var i = 0; i < fields.length; i++) {
        var field = fields[i];
        var fieldValue = field.dataIndex;
        if (typeof field.header === 'undefined') { // solo intersan campos validos
          continue;
        }
        var fieldName = field.header;
        option = $('<option value="' + fieldValue + '">' + fieldName + '</option>');
        select.append(option);
      }
    }
    var label = $('<label>Categoría</label>');
    div.append(select);
    div.append(label);
    container.append(div);

    $(container).find('select').material_select();
  };

  addMapFilter = function(report) {
    var container = $('#chart-map-filters');
    container.html('');

    var filters = report.filters;
    if (typeof filters !== 'undefined' && filters !== '' && typeof filters.length !== 'undefined') {
      var select = $('<select onchange="mapTools.changeFilter(this, \'' + REPORTLAYERID + '\')"></select>');
      var option = $('<option value="" disabled selected>Seleccione un filtro</option>');
      select.append(option);

      for (var j = 0; j < filters.length; j++) {
        var filter = filters[j];
        option = $('<option value="' + filter.filter + '">' + filter.name + '</option>');
        select.append(option);
      }

      var label = $('<label>Seleccione el Filtro para el Mapa</label>');
      container.append(select);
      container.append(label);
      $(container).find('select').material_select();
    }
  };

  loadRESTData = function(report, cookie, parameters) {
    // Please see REST controller for more options
    // https://github.com/SpagoBILabs/SpagoBI/blob/SpagoBI-5.1/SpagoBIProject/src/it/eng/spagobi/api/DataSetResource.java

    var container = $('#criteria-chart');
    container.html('');

    loadingIcon(true, 'Consultando...');

    var url = report.restUrl;
    console.log('loadRESTData url', url);

    parameters = (typeof parameters !== 'undefined' && parameters !== '') ?
      parameters : {};
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
      console.log('loadRESTData spagoBIresponse', spagoBIresponse);
      lastSpagoBIresponse = spagoBIresponse;
      if (typeof spagoBIresponse.errors !== 'undefined') {
        generalReport.displayMessage('Error: ' + window.JSON.stringify(spagoBIresponse));
        return;
      }
      addListCriteria(report, spagoBIresponse);
      addMapFilter(report);
      loadingIcon(false, 'Terminado...');
    }).fail(function(e) {
      console.log('loadRESTData error', e);
      loadingIcon(false, 'Error...');
    });
  };

  queryDatasetData = function() {
    console.log('queryDatasetData', lastReport);
    var parameters = {};
    var lastParameters = lastReport.query.parameters;
    for (var iParameter in lastParameters) {
      if (lastParameters.hasOwnProperty(iParameter)) {
        //var parameter = lastParameters[iParameter];
        var id = 'form-chart-' + iParameter;
        parameters[iParameter] = $('#' + id).val();
        if (parameters[iParameter] === null || parameters[iParameter] === '') {
          generalReport.displayMessage('Todos los campos son requeridos.');
          return;
        }
      }
    }
    console.log('queryDatasetData parameters', parameters);

    loadRESTData(lastReport, lastCookie, parameters);
  };

  authenticate = function(report) {
    loadingIcon(true, 'Consultando...');
    var url = report.authUrl;
    //url = 'http://sig.udistrital.edu.co/proxy?url=' + escape(url);
    url = '/proxy?url=' + window.escape(url) + '&renameheaders';
    console.log('authenticate url', url);

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
        loadFormData(report, setCookie);
        // loadRESTData(report, setCookie);
        loadingIcon(false, 'Terminado...');
      },
      error: function(err) {
        console.log('error', err);
        loadingIcon(false, 'Error...');
      }
    });

  };

  changeSelectChart = function() {
    var reportId = $('#select-chart-select').val();
    authenticate(getReportById(reportId));
  };

  //poligono styles
  styleFunction = function(feature, lastChartData) {
    var codPredial = feature.get('Código').toString();
    var grupoDatos = lastChartData.find(function(element) {
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
    console.log('grupoDatos', grupoDatos, colorFill, colorStroke);
    console.log('styleFunction', feature.getGeometry().getType(), styles[feature.getGeometry().getType()]);
    return styles[feature.getGeometry().getType()];
  }

  createLayer = function(filter, lastChartData) {
    var configLayer = {
      id: REPORTLAYERID,
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
        return styleFunction(feature, lastChartData);
      }
    });

    return serviceLayer;
  };

  addChartDataToMap = function() {
    var layer = createLayer(true, lastChartData);
    layer.source = {
      config: {
        filters: lastReport.filters
      }
    }
    window.getMap().addLayer(layer);
  };

  removeChartOfMap = function() {
    window.getMap().removeLayer(window.getMap().getLayer(REPORTLAYERID));
  };

  getReports = function() {
    return reports;
  };

  getReportById = function(idReport) {
    return reports.find(function(report) {
      return report.id === idReport;
    });
  };

  openSpagobiLinkReport = function() {
    Sbi.sdk.services.setBaseUrl({
      protocol: 'https',
      host: 'intelligentia.udistrital.edu.co',
      port: '8443',
      contextPath: 'SpagoBI',
      controllerPath: 'servlet/AdapterHTTP'
    });

    Sbi.sdk.api.authenticate({
      params: {
        user: 'bicirene',
        password: 'bicirene'
      },
      callback: {
        fn: function(result, args, success) {
          if (success === true) {
            exec();
          } else {
            alert('ERROR: Usuario o Clave incorrecta.');
          }
        }
        //, scope: this
        //, args: {arg1: 'A', arg2: 'B', ...}
      }
    });

    var exec = function() {
      var url = Sbi.sdk.api.getDocumentUrl({
        documentLabel: 'RteEspFis',
        executionRole: '/spagobi/user/bicirene',
        displayToolbar: false,
        displaySliders: false,
        height: '500px',
        width: '800px',
        iframe: {
          style: 'border: 0px;'
        },
        useExtUI: true
      });
      console.log('url', url);
      window.open(url, "_blank");
    };
  }

  exposeGlobals = function() {
    if (typeof window !== 'undefined') {
      window.reports = {
        addChartDataToMap: addChartDataToMap,
        removeChartOfMap: removeChartOfMap,
        changeSelectChart: changeSelectChart,
        getReports: getReports,
        queryDatasetData: queryDatasetData,
        chartByCriteria: chartByCriteria,
        openSpagobiLinkReport: openSpagobiLinkReport
      };
    }
  };

  function exposeForTests() {
    if (typeof describe !== 'undefined') {
      // for tests
      window._scopeReports = {};
      // window._scopeReports.global = global;
    }
  }

  if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    console.log('Load module for Node.js');
    // module.exports = something;
  } else {
    exposeGlobals();
    exposeForTests();
  }

})();

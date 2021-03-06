/**
 * @module reports
 * @author [juusechec]{@link https://github.com/juusechec}
 * @name reports
 * @description Establece los atributos y métodos del módulo reports.
 */
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
  var FEATUREID = 'Código';

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

  // Se carga al inicio para traer del JSON la configuración de los reportes
  $(function() {
    console.log("Ready reports.js!");
    loadJSONData();
  });

  /**
   * Carga desde el objeto reports el select para cargar reportes.
   * @function
   */
  loadSelectReports = function(reports) {
    var container = $('#select-chart');
    var select = $('<select id="select-chart-select" onchange="reports.changeSelectChart(event);"></select>');
    var option = $('<option value="" disabled selected>Seleccione un reporte.</option>');
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
   * @function
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
   * Contiene la lista de Colores en formato rgb como en CSS.
   * @object
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
   * @function
   * @param {array} response - Un arreglo de items a graficar. Ex:
   var response = [
     {
       'nombre': 'femenino',
       'alias': 'Género Femenino',
       'idsFeatures': ['034234', '234234', '334234', '734234']
     }, {
       'nombre': 'masculino',
       'alias': 'Género Masculino',
       'idsFeatures': ['034334', '22234', '334774', '730000']
     }, {
       'nombre': 'desconocido',
       'alias': 'No Disponible',
       'idsFeatures': ['0332224', '2232323', '3334723', '7333300']
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
      // Se agrega color para ponerlo luego en la geometria del mapa
      response[i].color = colorlist[j];
      // Si se desborda se repiten los colores de nuevo.
      j = (j >= colorlist.length) ?
        0 :
        j + 1;
      var alias = response[i].alias;
      var numFeatures = response[i].idsFeatures.length;
      labels.push(alias);
      data.push(numFeatures);
    }
    console.log('graphPie color', newColorList, data, labels, response);

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

  /**
   * Retorna el nombre de la pseudo-columna column# que maneja el objeto
   * spagoBIresponse.
   * @function
   * @param {array} dataSetFields - Del tipo responseSpagoBI.metaData.fields
   * @param {string} datasetColumn - Nombre del header columna que retorna
   * spagobi, es el nombre real, por ejemplo "facultad", "tipo", "etc."
   * @returns {string} columnName nombre de la pseudo-columna "columna#"
   */
  searchDatasetFieldsByColumn = function(dataSetFields, datasetColumn) {
    return dataSetFields.find(function(field) {
      var columnName = field.header;
      return columnName === datasetColumn;
    }).dataIndex;
  };

  /**
   * Dibuja los parámetros se selección para consultar el reporte en spagoBI.
   * Esto está diseñado para ser llamado por medio de un for e inyectar el
   * contexto CTX como un parámetro.
   * @function
   * @param {object} response - Respuesta de dataset SpagoBI
   * @param {object} ctxParameter - Un objeto de reportes[].query.parameters.{}
   * traido desde el JSON reportes.json
   */
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

  /**
   * Consulta los parámetros que son DataSets en SpagoBI (servicios web) a través
   * de un proxy hecho en GO, este proxy reescribe la cabecera Cookie que lleva
   * la autenticación y retorna la información del servicio.
   * @function
   * @param {object} report - Del tipo reportes[] con este se accede a la
   * configuración del reporte traida de reportes.json
   * @param {string} cookie - Es el valor de la cabecer cookie,
   * {@link https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cookie}
   */
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

  /**
   * Recoge el valor del input #category-field y con esto realiza una gráfica
   * con los valores que tiene ese campo en el reporte de SpagoBI.
   * @function
   */
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
          'idsFeatures': elements[key]
        });
      }
    }

    console.log('chartByCriteria response', response);
    graphPie(response);
  };

  /**
   * Activa o desactiva el componente que muestra un gif de cargando, el gif
   * sirve para indicar al usuario si está realizando o no algun proceso o
   * consulta.
   * @function
   * @param {boolean} activate - Indica si debe activarse(true) o desactivarse
   * (false) el indicador.
   * @param {string} message - Es el mensaje que se muestra junto al gif, ejemplos
   * de este pueden ser "Cargando...", "Buscando...", etc.
   */
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

  /**
   * Agrega los criterios o campos para analizar, especificados en reportes.json
   * en el objeto reportes[].listCriteria, por ejemplo, hacer el PIE con Todos
   * los distintos valores del "Tipo de Espacio". Estos criterios se agregan a
   * un html select para ser seleccionados y automáticamente generar una gráfica.
   * @function
   * @param {object} report - De tipo reportes[] que viene de reportes.json, con
   * este debería ser el objeto del reporte actual.
   * @param {object} spagoBIresponse - La respuesta de la petición ajax a la URL
   * al servicio REST del DataSet asociado al reporte en SpagoBI.
   */
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

  /**
   * Se agrega un html select con los valores de filtros en reportes[].filters
   * del archivo reportes.json, estos filtros se usan para filtrar los elementos
   * puestos en el mapa (después de poner la gráfica), como puntos, líneas o
   * polígonos.
   * @function
   * @param {object} report - El objeto de reporte actual el reportes[] de
   * reportes.json
   */
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

  /**
   * Recoge el reporte actual para extraer la URL, a esto le poner las
   * cabeceras, cookies para acceder al recurso y le agrega los parámetros con
   * el que se obtienen los datos del reportes en forma de DataSet (via REST).
   * @function
   * @param {object} report - Reporte actual de reportes.json
   * @param {string} cookie - Valor de la cabecera Cookie con los accesos al
   * recurso.
   * @param {object} parameters - Los parámetros con los que se filtra, por
   * ejemplo:
   var parameters = {
     facultad: 33,
     semestre: 1,
     anno: 2015
   }
   */
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

  /**
   * Cuando se selecciona un reporte, los datos de este quedan en la variable
   * lastReport, de ahí se lee el último reporte, luego se mira que los
   * parámetros seleccionados estén todos diligenciados, luego va y consulta
   * el servicio REST asociado al DataSet de SpagoBI del Reporte elegido.
   * @function
   */
  queryDatasetData = function() {
    console.log('queryDatasetData', lastReport);
    if (lastReport === null) {
      generalReport.displayMessage('Seleccione un reporte.');
      return;
    }

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

  /**
   * Con el reporte, busca la url de autenticación, se autentica con las
   * credenciales, se obtiene las cabeceras de la petición que permiten la
   * autenticación y se cargan los datos del formulario con esa Cookie que
   * permite el acceso.
   * @function
   * @param {object} report - El reporte actual de reportes.json
   */
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

  /**
   * Captura el valor del reporte seleccionado actualmente y ejecuta otra
   * función con la que se autentica para proceseguir con la carga de elementos
   * para el formulario.
   * @function
   */
  changeSelectChart = function() {
    var reportId = $('#select-chart-select').val();
    authenticate(getReportById(reportId));
  };

  /**
   * Función que devuelve los estilos usados para la capa del mapa, estos los
   * obtiene analizando el color del criterio seleccionado y se lo agrega a los
   * elementos del mapa que coincidan con el código del espacio físico.
   * @function
   * @param {object} feature - La geometría de tipo punto, línea o polígono
   * (etc.) a la que se desea asignarle algún color teniendo en cuenta los
   * colores usados en la gráfica.
   * @param {array} lastChartData - los datos de la última gráfica, por
   * ejemplo:
   var lastChartData = {
     color: 'rgb(255,255,255)',
     idFeatures : [123, 456, 789]
   };
   * @returns {object} style - De tipo ol.style.Style según el tipo de geometría
   * que ingrese.
   */
  styleFunction = function(feature, lastChartData) {
    var codIdFeature = feature.get(FEATUREID).toString();
    var grupoDatos = lastChartData.find(function(element) {
      return element.idsFeatures.indexOf(codIdFeature) > -1;
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
  };

  /**
   * Crea un layer de tipo ol.layer.Vector con el que se configuran filtro o
   * filtros que permiten mostrar los datos mostrados en la gráfica de forma
   * gráfica y correspondiente con la capa espacios físicos.
   * @function
   * @param {boolean} filter - Si la capa está filtrada (true) o no (false).
   * @param {object} lastChartData - Los últimos datos de la gráfica.
   * @param {object} lastReport - Los últimos datos del reporte de reportes.json
   * @returns {object} serviceLayer - De tipo ol.layer.Vector, es la capa que
   * filtra y colorea los datos de el GeoJSON de Geoserver correspondiente a
   * espacios físicos.
   */
  createLayer = function(filter, lastChartData, lastReport) {
    console.log('createLayer lastChartData', lastChartData);
    var configLayer = {
      id: REPORTLAYERID,
      filter: filter,
      filters: lastReport.filters
    };
    // Se quita antes de poner una nueva
    window.getMap().removeLayer(window.getMap().getLayer(configLayer.id));

    var geojsonFormat = new ol.format.GeoJSON();
    var wfsLoader = function(extent, resolution, projection) {
      var wfsSource = this;
      // var newExtent = window.getMap().getView().calculateExtent(window.getMap().getSize());
      // extent = newExtent;
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

  /**
   * Agrega una copia de la capa espacios físicos al mapa.
   * @function
   */
  addChartDataToMap = function() {
    var layer = createLayer(true, lastChartData, lastReport);
    window.getMap().addLayer(layer);
  };

  /**
   * Remueve la capa copia de espacios físicos del mapa.
   * @function
   */
  removeChartOfMap = function() {
    window.getMap().removeLayer(window.getMap().getLayer(REPORTLAYERID));
  };

  /**
   * Método GET para la variable 'reports'.
   * @function
   */
  getReports = function() {
    return reports;
  };

  /**
   * Obtiene un reporte del objeto resultante de leer reportes.json, estos están
   * identificados por un 'id' con el que se busca y se retorna únicamente ese
   * elemento
   * @function
   * @param {string} idReport - Parámetro id con el que se identifica el reporte
   * en el archivo reportes.json
   * @returns {object} report - Reporte identificado con parámetro idReport
   */
  getReportById = function(idReport) {
    return reports.find(function(report) {
      return report.id === idReport;
    });
  };

  /**
   * Abre el link del reporte SpagoBI en una pestaña independiente. Este reporte
   * tiene la interfaz de SpagoBI. Se autentica y se obtiene el link usando el
   * SDK de Javascript (Javascript SpagoBI API).
   * {@link http://spagobi.readthedocs.io/en/latest/user/JS/README/index.html}
   * Se obtiene los parámetros base de la configuración en
   * reportes[].documentData del archivo reportes.json
   * @function
   */
  openSpagobiLinkReport = function() {
    if (lastReport === null) {
      generalReport.displayMessage('Seleccione un reporte.');
      return;
    }

    var documentData = lastReport.documentData;
    Sbi.sdk.services.setBaseUrl(documentData.baseURL);

    var exec = function() {
      var url = Sbi.sdk.api.getDocumentUrl({
        documentLabel: documentData.documentLabel,
        executionRole: documentData.executionRole,
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

    Sbi.sdk.api.authenticate({
      params: {
        user: documentData.user,
        password: documentData.password
      },
      callback: {
        fn: function(result, args, success) {
          if (success === true) {
            exec();
          } else {
            window.alert('ERROR: Usuario o Clave incorrecta.');
          }
        }
        //, scope: this
        //, args: {arg1: 'A', arg2: 'B', ...}
      }
    });
  };

  /**
   * Expone los métodos necesarios como parte de la variable 'reports'
   * para ser utilizada en cualquier parte fuera de este contexto y en contexto
   * window.
   * @function
   */
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

  /**
   * Expone los métodos necesarios como parte de la variable '_scopeReports'
   * para ser utilizada en los tests con karma+jasmine en phantomjs para
   * hacerlos headless. Vea el archivo tests/reports_spec.js
   * @function
   */
  function exposeForTests() {
    if (typeof describe !== 'undefined') {
      // for tests
      window._scopeReports = {};
      // window._scopeReports.global = global;
    }
  }

  // Está proyectado por si se quire trabajar en NodeJS, necesita ajustes.
  if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    console.log('Load module for Node.js');
    // module.exports = something;
  } else {
    exposeGlobals();
    exposeForTests();
  }

})();

window.chartColors = {
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

window.randomScalingFactor = function() {
  return (Math.random() > 0.5
    ? 1.0
    : -1.0) * Math.round(Math.random() * 100);
};

var randomScalingFactor = function() {
  return Math.round(Math.random() * 100);
};

var lastCharData = null;

window.graficarPie = function(response) {
  //var url = require('file-loader!./pie.json');
  // var url = 'https://ide.proadmintierra.info/odk/' + value;
  // console.log(url);
  // $.ajax({url: url}).done(function(response) {
  //console.log('response', response);

  var data = [];
  var labels = [];
  var colorlist = [
    window.chartColors.red,
    window.chartColors.green,
    window.chartColors.orange,
    window.chartColors.blue,
    window.chartColors.yellow,
    window.chartColors.purple,
    window.chartColors.grey,
    window.chartColors.pink,
    window.chartColors.magenta,
    window.chartColors.cyan,
    window.chartColors.brown
  ];

  for (var i = 0; i < response.length; i++) {
    response[i].color = colorlist[i];
    var alias = response[i].alias;
    var numPredios = response[i].predios.length;
    labels.push(alias);
    data.push(numPredios);
  }

  lastCharData = response;

  if (typeof window.myPieConfig !== 'undefined') {
    window.myPieConfig.data.datasets.splice(0, 1); //Se elimina el anterior
    var newDataset = {
      backgroundColor: colorlist,
      data: data,
      label: 'Gráfica'
    };
    var newLabel = labels;
    window.myPieConfig.data.datasets.push(newDataset);
    window.myPieConfig.data.labels = newLabel;
    window.myPie.update();
    return;
  }
  window.myPieConfig = {
    type: 'pie',
    data: {
      datasets: [
        {
          data: data,
          backgroundColor: colorlist,
          label: 'Gráfica'
        }
      ],
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
            return label + ': ' + value + ' Predios ' + precentage + '%';
          }
        }
      }
    }
  };

  var ctx = document.getElementById('chart-area').getContext('2d');
  window.myPie = new Chart(ctx, window.myPieConfig);
  //});

};

// $(document).ready(function() {
//   window.graficarPie();
// });

window.addChartDataToMap = function() {
  // var layer = window.createLayer(true, lastCharData);
  // window.map.addLayer(layer);
};

window.removeChartOfMap = function() {
  window.map.removeLayer(window.map.getLayer('piloto-filtrado'));
};



var cargarDatos = function(cookie) {
  // Please see REST controller for more options
  // https://github.com/SpagoBILabs/SpagoBI/blob/SpagoBI-5.1/SpagoBIProject/src/it/eng/spagobi/api/DataSetResource.java

  var url = 'https://intelligentia.udistrital.edu.co:8443/SpagoBI/restful-services/1.0/datasets/DSEspFis/data';

  var parameters = {
    facultad: 33,
    semestre: 1,
    anno: 2015
  }
  parameters = escape(JSON.stringify(parameters));
  url = url + '?parameters=' + parameters;

  var selections = {
    "DSEspFis": {}
  }
  selections = escape(JSON.stringify(selections));
  url = url + '&selections=' + selections;

  var headers = 'Cookie:' + cookie;
  url = '/proxy?headers=' + escape(headers) + '&url=' + escape(url);

  $.ajax({url: url, method: 'GET', dataType: 'json'}).done(function(spagoBIresponse) {
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
      if (typeof elements[categoryValue] === 'undefined'){
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
        })
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
}

window.autenticar = function() {
  var _dc = new Date().getTime();
  var url = 'https://intelligentia.udistrital.edu.co:8443/SpagoBI/servlet/AdapterHTTP?Page=LoginPage&NEW_SESSION=TRUE&userId=bicirene&password=bicirene';
  //url = 'http://sig.udistrital.edu.co/proxy?url=' + escape(url);
  url = '/proxy?url=' + escape(url) + '&renameheaders';

  $.ajax({
    type: 'GET',
    url: url,
    beforeSend: function(xhr) {
      //xhr.setRequestHeader('Cookie', '');
    },
    success: function(output, status, xhr) {
      //console.log('success', output, status, xhr);
      console.log('coookie', xhr.getResponseHeader('_Set-Cookie'));
      cargarDatos(xhr.getResponseHeader('_Set-Cookie'));
    },
    error: function(err) {
      console.log('error', err);
    }
  }).always(function() {
    console.log('complete');
  });

};

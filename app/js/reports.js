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
  return (Math.random() > 0.5 ?
    1.0 :
    -1.0) * Math.round(Math.random() * 100);
};

var randomScalingFactor = function() {
  return Math.round(Math.random() * 100);
};

var lastCharData = null;

window.graficarPie = function(value) {
  //var url = require('file-loader!./pie.json');
  // var url = 'https://ide.proadmintierra.info/odk/' + value;
  // console.log(url);
  // $.ajax({url: url}).done(function(response) {
  //console.log('response', response);
  var response = [{
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
  }];

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

$(document).ready(function() {
  window.graficarPie();
});

window.addChartDataToMap = function() {
  // var layer = window.createLayer(true, lastCharData);
  // window.map.addLayer(layer);
};

window.removeChartOfMap = function() {
  window.map.removeLayer(window.map.getLayer('piloto-filtrado'));
};

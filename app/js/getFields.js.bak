var configCapas = new Array()
var configGrupos = new Array()

$.when($.ajax({
        type: 'GET',
        url: 'conf/serviciosFijos.json',
        dataType: 'json'
    }),
    $.ajax({
        type: 'GET',
        url: 'conf/grupos.json',
        dataType: 'json'
    })).done(function(serviciosFijos, grupos) {
    console.log('Ok:', serviciosFijos, grupos)
    configCapas = serviciosFijos[0]
    configGrupos = grupos[0]
}).then(function(a1, a2) {
    console.log('Ok then:', a1, a2)
}, function(a1, a2) {
    console.log('Failure:', a1, a2)
})

var map
var urlServicio
var FeatureLayer
var jsonString
var featureLayers

function createMap(urlServicio, min, max) {
    require([
        'esri/map',
        'esri/layers/VectorTileLayer',
        'esri/layers/FeatureLayer',
        'esri/layers/ArcGISTiledMapServiceLayer',
        'esri/geometry/Extent',
        'esri/SpatialReference',
        'esri/InfoTemplate',
        'esri/dijit/Scalebar',
        'esri/toolbars/navigation',
        'dojo/domReady!'
    ], function(
        Map,
        VectorTileLayer,
        FeatureLayer,
        ArcGISTiledMapServiceLayer,
        Extent,
        SpatialReference,
        InfoTemplate,
        Scalebar,
        Navigation
    ) {

        //xmin, xmax, ymin, ymax
        var startExtent = new Extent(-8247776.0260493355,
            513403.24603438814, -8244107.048691551,
            515206.682170539,
            new SpatialReference({
                wkid: 102100
            })
        )

        // var map = new Map('map', {
        //     center: [-74, 4], // longitude, latitude
        //     zoom: 2, // zoom factor
        //     //extent: startExtent,
        //     basemap: 'topo'
        // })
        // window.map = map
        $('#results').empty()

        window.urlServicio = urlServicio
        window.FeatureLayer = FeatureLayer
        window.jsonString = '['
        window.featureLayers = new Array()
        llenarCapa(0, min, max)

        // var vtlayer = new VectorTileLayer('https://www.arcgis.com/sharing/rest/content/items/bf79e422e9454565ae0cbe9553cf6471/resources/styles/root.json')
        // map.addLayer(vtlayer)

        // var fl = new FeatureLayer('https://services7.arcgis.com/lUZlLTBKH3INlBpk/arcgis/rest/services/Geodatabase_Redes_CAN/FeatureServer/0', {
        //     mode: FeatureLayer.MODE_ONDEMAND,
        //     // tileWidth: 200,
        //     // tileHeight: 200
        // })
        // window.fl = fl
        // map.addLayer(fl)
        // for (var i = 0; i <= 21; i++) {
        //   map.addLayer(new FeatureLayer('https://services7.arcgis.com/lUZlLTBKH3INlBpk/arcgis/rest/services/IRSP_V1/FeatureServer/'+i, {
        //     mode: FeatureLayer.MODE_ONDEMAND,
        //   }))
        // }

        // for (var i = 10; i <= 15; i++) {
        //   map.addLayer(new FeatureLayer('https://services7.arcgis.com/lUZlLTBKH3INlBpk/ArcGIS/rest/services/IRSP_V1/FeatureServer/'+i, {
        //     mode: FeatureLayer.MODE_ONDEMAND,
        //   }))
        // }

        //map.addLayer(new ArcGISTiledMapServiceLayer('https://services7.arcgis.com/lUZlLTBKH3INlBpk/arcgis/rest/services/IRSP_V1/MapServer'))
    })
}

function llenarCapa(actual, min, max) {
    var urlLayer = urlServicio + '/' + actual
    console.log('urlLayer', urlLayer)
    var fl = new FeatureLayer(urlLayer, {
        mode: FeatureLayer.MODE_ONDEMAND,
        // tileWidth: 200,
        // tileHeight: 200
    })
    window.featureLayers.push(fl)
    //map.addLayer(fl)
    fl.on('load', function() {
        llenarFilas(fl, actual, min, max)
    })
}

function llenarFilas(fl, actual, min, max) {
    console.log('fl', fl)
    var jsonFields = ''
    for (var i = 0; i < fl.fields.length; i++) {
        var field = fl.fields[i]
        var alias = field.alias.replace(/(\r\n|\n|\r)/gm, '')
        var name = field.name.replace(/(\r\n|\n|\r)/gm, '')
        var domain = field.domain
        if (domain === undefined) {
            domain = ''
        } else {
            domain = ', "domain": ' + JSON.stringify(domain)
        }
        var json = '\n\
             {\n\
                "alias": "' + alias + '",\n\
                "name": "' + name + '"\n\
                ' + domain + '\n\
              },'
        if (name === 'OBJECTID') {
            json = ''
        }
        jsonFields += json
    }
    jsonFields = jsonFields.substring(0, jsonFields.length - 1)
    console.log('jsonFields', jsonFields)
    var id = fl.name
    if (configCapas[id] === undefined) {
        window.alert('La capa ' + id + ' no tiene nombre.')
        return
    }
    if (configCapas[id].maxScale === undefined) {
        window.alert('La capa ' + id + ' no tiene maxScale.')
    }
    var name = configCapas[id].name
    var maxScale = configCapas[id].maxScale
    var layerId = actual
    var icon = ''
    if (configCapas[id].icon !== undefined) {
        icon = '"icon": "' + configCapas[id].icon + '",'
    }
    var enable = configCapas[id].enable
    var visible = ''
    if (configCapas[id].visible !== undefined) {
        visible = '"visible": "' + configCapas[id].visible + '",'
    }
    var groupId = configCapas[id].groupId
    var jsonLayer = '\n\
        {\n\
        "name": "' + name + '",\n\
        "id": "' + id + '",\
        "layerId": "' + layerId + '",\n\
        "enable": ' + enable + ',\n\
        "minScale": 0,\n\
        "maxScale": ' + maxScale + ',\n\
        ' + icon + '\n\
        ' + visible + '\n\
        "groupId": "' + groupId + '",\n\
        "fields": [' + jsonFields + ']\n\
      },'
    console.log('jsonLayer', jsonLayer)
    jsonString += jsonLayer

    if (actual == max) {
        jsonString = jsonString.substring(0, jsonString.length - 1)
        jsonString += ']'
        $('#results').html(jsonString)
        return
    }

    llenarCapa(++actual, min, max)
}

function generarJSON() {
    var url = $('#miForm').find('input[name="capa"]').val()
    var min = $('#miForm').find('input[name="minima"]').val()
    var max = $('#miForm').find('input[name="maxima"]').val()
    if (url !== '' && min !== '' && max !== '') {
        console.log('url', url)
        createMap(url, min, max)
    } else {
        window.alert('Algun campo vacío.')
    }
}

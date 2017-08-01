function generateReports(reportNumber, opt) {
    if (!window.currentGeometry) {
        displayMessage('Por favor dibujer primero una geometría.')
        return
    } else {
        //window.currentGeometry = undefined
    }
    loadingIcon(true, 'Lanzando Reporte...')
    require(['dojo/request/xhr'], function(xhr) {
        if (reportNumber === 1) {
            getRedesAfectadas(function(results) {
                xhr('templates/reporte1.html').then(function(html) {
                    generateQuickReport1(html, results, opt)
                })
            })
        }
    })
}

function generateReport1() {
    if (!window.currentGeometry) {
        displayMessage('Por favor dibujer primero una geometría.')
        return
    } else {
        //window.currentGeometry = undefined
    }
    loadingIcon(true, 'Generando Imagen...')
    printMap(function(imageUrl) {
        window.generateReports(1, {
            imageUrl: imageUrl
        })
    })
}

function generateQuickReport1(html, results, opt) {
    loadingIcon(false, 'Terminado...')
    var viewData = {
        name: 'Jonny',
        occupation: 'GLUD',
        imageUrl: opt.imageUrl,
        imageexist: (opt.imageUrl !== undefined),
        baseUrl: window.location.origin,
        resultado: results
    }
    console.log(viewData)
    var output = Mustache.render(html, viewData)
    console.log(output)

    var w = window.open('about:blank', '_blank')
    w.document.write(output)
    //w.print()
    //w.onfocus=function(){ w.alert('El reporte ha sido generado exitósamente.') }
    setTimeout(function() {
        w.stop()
    }, 5000)
    //w.document.body.innerHTML = output
}

function loadingIcon(activate, message) {
    document.getElementById('loading-report-message').innerHTML = message
    setTimeout(function() {
        if (activate) {
            document.getElementById('loading-report').style.display = 'block'
        } else {
            document.getElementById('loading-report').style.display = 'none'
        }
    }, 200)
}


function printMap(listener) {
    require([
        'esri/tasks/PrintTask',
        'esri/tasks/PrintParameters',
        'esri/tasks/PrintTemplate'
    ], function(
        PrintTask,
        PrintParameters,
        PrintTemplate
    ) {
        var url = 'http://sampleserver6.arcgisonline.com/arcgis/rest/services/Utilities/PrintingTools/GPServer/Export%20Web%20Map%20Task'
        var printTask = new PrintTask(url)

        var template = new PrintTemplate()
        template.exportOptions = {
            width: 500,
            height: 400,
            dpi: 96
        }
        template.format = 'PNG32'
        template.layout = 'MAP_ONLY'
        template.preserveScale = false

        var params = new PrintParameters()
        params.map = map
        params.template = template

        printTask.execute(params, function(response) {
            console.log(response.url)
            var imageUrl = response.url
            listener(imageUrl)
        })
    })
}

function getLayerByURL(url) {
    for (var i = 0; i < servicios.length; i++) {
        var servicio = servicios[i]
        if (servicio.layers !== undefined) {
            for (var j = 0; j < servicio.layers.length; j++) {
                var layer = servicio.layers[j]
                var newUrl = servicio.url + '/' + layer.layerId
                if (url === newUrl) {
                    return window.map.getLayer(layer.id)
                }
            }
        }
    }
}

var resultadosRedesAfectadas = new Array()

function getRedesAfectadas(listener) {
    require([
        'esri/tasks/QueryTask',
        'esri/tasks/query',
        'dojo/promise/all',
        'dojo/Deferred'
    ], function(
        QueryTask,
        Query,
        all,
        Deferred
    ) {
        window.resultadosRedesAfectadas = new Array()
        var deferreds = new Array()
        for (var i = 0; i < servicios.length; i++) {
            var servicio = servicios[i]
            if (servicio.layers !== undefined) {
                for (var j = 0; j < servicio.layers.length; j++) {
                    var layer = servicio.layers[j]
                    var featureLayer = window.map.getLayer(layer.id)
                    if (featureLayer !== undefined) {
                        console.log('featureLayer.url', featureLayer.url)
                        var queryTask = new QueryTask(featureLayer.url)
                        var query = new Query()
                        query.returnGeometry = false
                        query.geometry = window.currentGeometry
                        query.outFields = ['*']
                        var deferred = new Deferred()
                        deferreds[layer.id] = deferred
                        queryTask.on('complete', function(results) {
                            //console.log('results: ', results);
                            var url = results.target.url
                            var newLayer = getLayerByURL(url)
                            //console.log('newLayer', newLayer)
                            var features = results.featureSet.features
                            if (features.length > 0) {
                                var entidades = new Array()
                                var queryLayer = getLayerByLayerId(newLayer.id)
                                for (var k = 0; k < features.length; k++) {
                                    var attributes = features[k].attributes
                                    var campos = new Array()
                                    var queryFields = getFieldsByLayer(queryLayer)
                                    for (var m in attributes) {
                                        //console.log(m, attributes, attributes[m])
                                        //console.log(queryFields)
                                        var texto = ''
                                        if (queryFields.alias[m] !== undefined) {
                                            if (queryFields.codedValues[m] !== undefined) {
                                                texto = queryFields.alias[m] + ': ' + queryFields.codedValues[m][attributes[m]]
                                            } else {
                                                texto = queryFields.alias[m] + ': ' + attributes[m]
                                            }
                                        } else {
                                            //Solo para OBJECTID?
                                            texto = m + ': ' + attributes[m]
                                        }
                                        var campo = {
                                            'texto': texto
                                        }
                                        campos.push(campo)
                                    }
                                    var entidad = {
                                        'campos': campos
                                    }
                                    entidades.push(entidad)
                                }
                                var resultado = {
                                    'capa': queryLayer.name,
                                    'entidades': entidades
                                }
                                console.log(resultado)
                                resultadosRedesAfectadas.push(resultado)
                            }
                            deferreds[newLayer.id].resolve(results)
                            //console.log(deferreds[layer.id].isResolved())
                            //console.log('results', layer.id, results)
                        })
                        queryTask.on('error', function(a, b, c) {
                            //console.log(deferreds[layer.id].isResolved())
                            console.log('Error: ', a, b, c)
                        })
                        queryTask.execute(query)
                    }
                    //console.log('layer', layer)
                    //console.log('featureLayer', featureLayer)
                }
            }
        }
        window.deferreds = deferreds
        var promises = new Array()
        for (var i in deferreds.length) {
            promises.push(deferreds[i].promise)
        }
        all(promises).then(function(results) {
            //callback
            console.log('results', results)
            listener(resultadosRedesAfectadas)
        }, function(err) {
            //errback
            console.log('err', err)
        }, function(update) {
            //progback
            console.log('update', update)
        })
    })
}

function getLayerByLayerId(layerId) {
    for (var i = 0; i < servicios.length; i++) {
        var servicio = servicios[i]
        if (servicio.layers !== undefined) {
            for (var j = 0; j < servicio.layers.length; j++) {
                var layer = servicio.layers[j]
                if (layer.id === layerId) {
                    return layer
                }
            }
        }
    }
}

function getFieldsByLayer(layer) {
    var fields = {
        'alias': new Object(),
        'codedValues': new Object()
    }
    if (typeof(layer.fields) === 'undefined' || layer.fields.length === 0) {

    } else {
        for (var i = 0; i < layer.fields.length; i++) {
            var field = layer.fields[i]
            fields.alias[field.name] = field.alias
            if (field.domain === undefined) {

            } else {
                var codedValues = field.domain.codedValues
                for (var j = 0; j < codedValues.length; j++) {
                    if (fields.codedValues[field.name] === undefined) {
                        fields.codedValues[field.name] = new Object()
                    }
                    fields.codedValues[field.name][codedValues[j].code] = codedValues[j].name
                }
            }
        }
    }
    return fields
}

// Input your config
var config = {
  host: 'playground.qlik.com',
  prefix: '/showcase/',
  port: '443',
  isSecure: true,
  rejectUnauthorized: false,
  appname: '0b0fc6d5-05ce-44d7-95aa-80d0680b3559'
}

var app
var alteredState = 'SecondState'
var selectionField = 'Recorded Class'
var hypercube

function main() {
  // @ts-ignore
  require.config({
    baseUrl:
      (config.isSecure ? 'https://' : 'http://') +
      config.host +
      (config.port ? ':' + config.port : '') +
      config.prefix +
      'resources'
  })

  /**
   * Load the entry point for the Capabilities API family
   * See full documention: http://help.qlik.com/en-US/sense-developer/Subsystems/APIs/Content/MashupAPI/qlik-interface-interface.htm
   */

  // @ts-ignore
  require(['js/qlik'], function(qlik) {
    // We're now connected
    console.log('QLIK', qlik)

    // Suppress Qlik error dialogs and handle errors how you like.
    qlik.setOnError(function(error) {
      console.log(error)
    })

    // Open a dataset on the server.
    console.log('Connecting to appname: ' + config.appname)
    app = qlik.openApp(config.appname, config)
    console.log('APP', app)

    // createBarChart() // Create a bar chart in the normal state
    // createBasicHyperCube() // Create a one dimensional hypercube
    // createMultiDimensionalHyperCube() // Create a HyperCube with multiple dimensions
    // getFieldData() // Get The Data For A Field
    // addAlternateState() // add a new state
    // createBarChartDifferentState() // Create a bar chart in a state separate from the normal state
    // createHyperCubeDifferentState() // Create a Hypercube in a state separate from the normal state
  })
}

function addAlternateState() {
  app.addAlternateState(alteredState)
  console.log('State Added:', alteredState)
}

function clearState(state) {
  state = state || '$'
  app.clearAll(false, state)
  if (state === '$') {
    document.getElementById('classesSelection').value = ''
  }
  console.log('State Cleared:', state)
}

function createBarChart() {
  var barChartColumns = [
    {
      qDef: { qFieldDefs: ['Decade'], qSortCriterias: [{ qSortByNumeric: 1 }] }
    },
    '=Count(id)'
  ]

  app.visualization.create('barchart', barChartColumns).then(function(bar) {
    bar.show('firstChart')
  })
}

function createBarChartDifferentState() {
  var barChartColumns = [
    {
      qDef: { qFieldDefs: ['Decade'], qSortCriterias: [{ qSortByNumeric: 1 }] }
    },
    '=Count(id)'
  ]

  app.visualization
    .create('barchart', barChartColumns, {
      qHyperCubeDef: { qStateName: alteredState }
    })
    .then(function(bar) {
      bar.show('secondChart')
    })
}

function createBasicHyperCube() {
  var hyperCubeDef = {
    qDimensions: [
      {
        qDef: {
          qFieldDefs: ['Decade'],
          qSortCriterias: [{ qSortByNumeric: 1 }]
        }
      }
    ],
    qMeasures: [{ qDef: { qDef: '=Count(id)' } }],
    qInitialDataFetch: [
      {
        qTop: 0,
        qLeft: 0,
        qHeight: 3333,
        qWidth: 3
      }
    ]
  }

  app
    .createCube(hyperCubeDef, hypercube => {
      console.log('Basic Hypercube', hypercube.qHyperCube)
    })
    .then(result => {
      console.log('promise result', result)
    })
}

function createMultiDimensionalHyperCube() {
  var hyperCubeDef = {
    qDimensions: [
      {
        qDef: {
          qFieldDefs: ['Decade'],
          qSortCriterias: [{ qSortByNumeric: 1 }]
        }
      },
      { qDef: { qFieldDefs: ['Fall Status'] } }
    ],
    qMeasures: [{ qDef: { qDef: '=Count(id)' } }],
    qInitialDataFetch: [
      {
        qTop: 0,
        qLeft: 0,
        qHeight: 3333,
        qWidth: 3
      }
    ]
  }

  var createdCube = app.createCube(hyperCubeDef, function(hypercube) {
    console.log(
      'Multi-Dimensional Hypercube',
      hypercube.qHyperCube.qDataPages[0]
    )
  })
  console.log(createdCube)
}

function createHyperCubeDifferentState() {
  var hyperCubeDef = {
    qStateName: alteredState,
    qDimensions: [
      {
        qDef: {
          qFieldDefs: ['Decade'],
          qSortCriterias: [{ qSortByNumeric: 1 }]
        }
      }
    ],
    qMeasures: [{ qDef: { qDef: '=Count(id)' } }],
    qInitialDataFetch: [
      {
        qTop: 0,
        qLeft: 0,
        qHeight: 600,
        qWidth: 2
      }
    ]
  }

  app.createCube(hyperCubeDef, function(hypercube) {
    console.log(
      'Hypercube for',
      alteredState,
      hypercube.qHyperCube.qDataPages[0]
    )
  })
}

function selectField() {
  var select = document.getElementById('classesSelection')
  if (select.value !== '') {
    app.field(selectionField).selectValues([select.value], false, true)
  }
}

function getFieldData() {
  var myField = app.field(selectionField)
  var listener = function() {
    console.log('Data for Field:', myField)
    var select = document.getElementById('classesSelection')

    select.appendChild(createOption('', '--Select--'))
    myField.rows.forEach(function(row) {
      select.appendChild(createOption(row.qText))
    })
    myField.OnData.unbind(listener)
  }
  myField.OnData.bind(listener)
  myField.getData()
}

function createOption(value, text) {
  var option = document.createElement('option')
  var name = document.createTextNode(text || value)
  option.setAttribute('value', value)
  option.appendChild(name)
  return option
}

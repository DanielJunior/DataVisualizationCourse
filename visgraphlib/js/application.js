'use strict';

var myApp = {};

myApp.chart01 = undefined;
myApp.chart02 = undefined;

myApp.data = [
  [   {
        'cx': 10,
        'cy': 25,
        'r': 5
      },
      {
        'cx': 20,
        'cy': 10,
        'r': 5
      },
      {
        'cx': 18,
        'cy': 15,
        'r': 5
      }
    ],
     [{
        'cx': 20,
        'cy': 65,
        'r': 5
      },
      {
        'cx': 32,
        'cy': 10,
        'r': 5
      },
      {
        'cx': 20,
        'cy': 15,
        'r': 5
      }
    ]
];

myApp.scatterplot_setup = {
  width: 500,
  height: 400,
  margins: {
    top: 20,
    right: 20,
    bottom: 30,
    left: 40
  },
  yAxis: true,
  xAxis: true,
  legends: ["Teste1","Teste2"],
  zoom: true,
  brush: true
}

myApp.histogram_setup = {
  width: 500,
  height: 400,
  margins: {
    top: 20,
    right: 20,
    bottom: 30,
    left: 40
  },
  yAxis: true,
  xAxis: true,
  xAxisName: "States",
  yAxisName: "Population"
}

myApp.run = function() {
  myApp.chart01 = new scatterplot();
  myApp.chart01.run("#my-div", myApp.data, myApp.scatterplot_setup);
  myApp.chart02 = new histogram();
  myApp.chart02.run("#my-div2", "http://localhost:8000/data/data.csv", myApp.histogram_setup);
  myApp.chart03 = new timeseries();
  myApp.chart03.run("#my-div3", "http://localhost:8000/data/data.csv", myApp.histogram_setup);

}

window.onload = myApp.run;

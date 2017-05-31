'use strict';

var app = {};

app.chart = undefined;

app.setup = {
    width: 800,
    height: 400,
    margins: {
        top: 20,
        right: 20,
        bottom: 30,
        left: 40
    }
};

app.run = function () {
    app.chart = new graph();
    app.chart.run("#graph-div", app.setup);
};

window.onload = app.run;
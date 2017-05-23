'use strict';

function timeseries() {

  var scope = this;
  var exports = {};

  scope.margins = {
    top: 10,
    right: 10,
    bottom: 100,
    left: 40
  };
  scope.brushMargins = {
    top: 430,
    right: 10,
    bottom: 20,
    left: 40
  };

  scope.width = 960 - scope.margins.left - scope.margins.right;
  scope.height = 500 - scope.margins.top - scope.margins.bottom;
  scope.heightBrush = 500 - scope.brushMargins.top - scope.brushMargins.bottom;

  scope.xScale = d3.scaleTime().range([0, scope.width]);
  scope.yScale = d3.scaleLinear().range([scope.height, 0]);
  scope.xScaleBrush = d3.scaleTime().range([0, scope.width]);
  scope.yScaleBrush = d3.scaleLinear().range([scope.heightBrush, 0]);
  scope.colorScale = d3.scaleOrdinal(d3.schemeCategory20);

  scope.line = undefined;
  scope.brushLine = undefined;

  scope.xAxis = d3.axisBottom(scope.xScale);
  scope.yAxis = d3.axisLeft(scope.yScale);
  scope.brushXAxis = d3.axisBottom(scope.xScaleBrush);

  scope.brush = d3.brushX().extent([
      [0, 0],
      [scope.width, scope.heightBrush]
    ])
    .on("brush", brushed);

  var svgRef, groupRef, brushGroupRef;

  scope.appendSVG = function(DOMObj) {

    var svgRef = d3.select(DOMObj)
      .append('svg')
      .attr('width', scope.width + scope.margins.left + scope.margins.right)
      .attr('height', scope.height + scope.margins.bottom + scope.margins.top);

    return svgRef;
  }

  scope.appendGroup = function(svgRef) {

    var group = svgRef.append('g')
      .attr("class", "groupRef")
      .attr('transform', 'translate(' + scope.margins.left + ',' + scope.margins.top + ')');

    return group;
  }

  scope.appendBrushGroup = function(svgRef) {

    var group = svgRef.append('g')
      .attr("class", "brushGroupRef")
      .attr('transform', 'translate(' + scope.brushMargins.left + "," + scope.brushMargins.top + ')');

    return group;
  }

  scope.defineLine = function() {

    scope.line = d3.line()
      .x(function(d) {
        return scope.xScale(d.date);
      })
      .y(function(d) {
        return scope.yScale(d.temperature);
      });
  }

  scope.defineBrushLine = function() {

    scope.brushLine = d3.line()
      .x(function(d) {
        return scope.xScaleBrush(d.date);
      })
      .y(function(d) {
        return scope.yScaleBrush(d.temperature);
      });

  }

  scope.loadAndAppendData = function(groupRef, brushGroupRef) {

    var parseTime = d3.timeParse("%Y%m%d");
    scope.defineLine();
    scope.defineBrushLine();

    d3.csv("data/timeseries_data.csv", function(dataset) {

      //returns array of cities
      var cities = dataset.columns.slice(1);

      var citiesFormatted = cities.map(function(city) {
        return {
          city: city,
          values: dataset.map(function(row) {
            return {
              date: parseTime(row.date),
              temperature: row[city]
            }
          })
        }
      });

      scope.xScale.domain(d3.extent(dataset, function(row) {
        return parseTime(row.date);
      }));

      scope.xScaleBrush.domain(d3.extent(dataset, function(row) {
        return parseTime(row.date);
      }));


      scope.yScale.domain([
        d3.min(citiesFormatted, function(city) {
          return d3.min(city.values, function(d) {
            return d.temperature;
          });
        }),

        d3.max(citiesFormatted, function(city) {
          return d3.max(city.values, function(d) {
            return d.temperature;
          });
        })
      ]);

      scope.yScaleBrush.domain([
        d3.min(citiesFormatted, function(city) {
          return d3.min(city.values, function(d) {
            return d.temperature;
          });
        }),

        d3.max(citiesFormatted, function(city) {
          return d3.max(city.values, function(d) {
            return d.temperature;
          });
        })
      ]);

      scope.colorScale.domain(citiesFormatted.map(function(d) {
        return d.city;
      }));

      scope.appendXAxisGroup(groupRef);
      scope.appendYAxisGroup(groupRef);
      scope.appendXAxisBrushGroup(brushGroupRef);

      var city = groupRef.selectAll(".city")
        .data(citiesFormatted)
        .enter()
        .append("g")
        .attr("class", "city");

      groupRef.selectAll(".city")
        .append("path")
        .attr("class", "line")
        .attr("d", function(d) {
          return scope.line(d.values);
        })
        .style("stroke", function(d) {
          return scope.colorScale(d.city);
        })
        .style("fill", function(d) {
          return "none";
        });

      var cityBrush = brushGroupRef.selectAll(".cityBrush")
        .data(citiesFormatted)
        .enter()
        .append("g")
        .attr("class", "cityBrush");

      cityBrush.append("path")
        .attr("class", "line")
        .attr("d", function(d) {
          return scope.brushLine(d.values);
        })
        .style("stroke", function(d) {
          return scope.colorScale(d.city);
        })
        .style("fill", function(d) {
          return "none";
        });

      brushGroupRef.append("g")
        .attr("class", "brush")
        .call(scope.brush)
        .call(scope.brush.move, scope.xScale.range());
    });
  }

  scope.appendXAxisGroup = function(groupRef) {
    groupRef.append('g')
      .attr("class", "axis axis--x")
      .attr("transform", "translate(0," + scope.height + ")")
      .call(scope.xAxis);
  }

  scope.appendYAxisGroup = function(groupRef) {
    groupRef.append("g")
      .attr("class", "axis axis--y")
      .call(scope.yAxis);
  }


  scope.appendXAxisBrushGroup = function(brushGroupRef) {

    brushGroupRef.append("g")
      .attr("class", "axis axis--x")
      .attr("transform", "translate(0," + scope.heightBrush + ")")
      .call(scope.brushXAxis);

  }

  function brushed() {
    if (d3.event.sourceEvent && d3.event.sourceEvent.type === "zoom") return; // ignore brush-by-zoom
    var transformation = d3.event.selection || scope.xScaleBrush.range();
    scope.xScale.domain(transformation.map(scope.xScaleBrush.invert, scope.xScaleBrush));
    groupRef.selectAll(".line").attr("d", function(d) {
      return scope.line(d.values)
    });
    groupRef.select(".axis--x").call(scope.xAxis);

  }


  exports.run = function(DOMObj, width, height, margin) {

    svgRef = scope.appendSVG(DOMObj);
    groupRef = scope.appendGroup(svgRef);
    brushGroupRef = scope.appendBrushGroup(svgRef);

    scope.loadAndAppendData(groupRef, brushGroupRef);
  }
  return exports;
}

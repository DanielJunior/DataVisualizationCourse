'use strict';

function appendSvg(scope) {
  var svg = d3.select(scope.div).append('svg')
    .attr('width', scope.width + scope.margins.left + scope.margins.right)
    .attr('height', scope.height + scope.margins.top + scope.margins.bottom);

  return svg;
}

function randomColor() {
  return 'rgb(' + Math.floor(Math.random() * 256) + ',' + Math.floor(Math.random() * 256) + ',' + Math.floor(Math.random() * 256) + ')';
}

function appendChartGroup(scope) {
  var chart = scope.svg.append('g')
    .attr('width', scope.width)
    .attr('height', scope.height)
    .attr('transform', 'translate(' + scope.margins.left + ',' + scope.margins.top + ')');

  return chart;
}

function loadCSVData(resourcePath, callback) {
  d3.csv(resourcePath, function(d, i, columns) {
    //turn data in proper representation
    for (var i = 1, n = columns.length; i < n; ++i) d[columns[i]] = +d[columns[i]];
    return d;
  }, callback);
}

function appendAxis(scope) {
  scope.chartGroup.append("g")
    .attr("class", "axis")
    .attr("transform", "translate(0," + scope.height + ")")
    .call(d3.axisBottom(scope.x0Scale))
    .append("text")
    .attr("x", scope.width / 2)
    .attr("y", scope.height - 20)
    .attr("dy", "0.32em")
    .attr("fill", "#000")
    .attr("font-weight", "bold")
    .attr("text-anchor", "start")
    .text(scope.xAxisName);

  scope.chartGroup.append("g")
    .attr("class", "axis")
    .call(d3.axisLeft(scope.y).ticks(null, "s"))
    .append("text")
    .attr("x", 2)
    .attr("y", scope.y(scope.y.ticks().pop()) + 0.5)
    .attr("dy", "0.32em")
    .attr("fill", "#000")
    .attr("font-weight", "bold")
    .attr("text-anchor", "start")
    .text(scope.yAxisName);
}

function appendRect(scope) {
  var t = d3.transition()
    .duration(750)
    .ease(d3.easeLinear);

  var bars = scope.chartGroup.append("g")
    .selectAll("g")
    .data(scope.data);

  bars.enter().append("g")
    .attr("transform", function(d) {
      return "translate(" + scope.x0Scale(d.State) + ",0)";
    })
    .selectAll("rect .bar")
    .data(function(d) {
      return scope.keys.map(function(key) {
        return {
          key: key,
          value: d[key]
        };
      });
    })
    .enter().append("rect")
    .transition()
    .ease(d3.easeLinear)
    .duration(500)
    .delay(function(d, i) {
      return i * 50;
    })
    .attr("x", function(d) {
      return scope.x1Scale(d.key);
    })
    .attr("y", function(d) {
      return scope.y(d.value);
    })
    .attr("width", scope.x1Scale.bandwidth())
    .attr("height", function(d) {
      return scope.height - scope.y(d.value);
    })
    .attr("fill", function(d) {
      return scope.colors(d.key);
    })
    .attr("class", "bar");
}

function appendLegend(scope) {
  var legend = scope.chartGroup.append("g")
    .attr("font-family", "sans-serif")
    .attr("font-size", 10)
    .attr("text-anchor", "end")
    .selectAll("g")
    .data(scope.keys.slice().reverse())
    .enter().append("g")
    .attr("transform", function(d, i) {
      return "translate(0," + i * 20 + ")";
    });

  legend.append("rect")
    .attr("x", scope.width - 19)
    .attr("width", 19)
    .attr("height", 19)
    .attr("fill", scope.colors);

  legend.append("text")
    .attr("x", scope.width - 24)
    .attr("y", 9.5)
    .attr("dy", "0.32em")
    .text(function(d) {
      return d;
    });

  return legend;
}

function appendXBrush(scope) {
  scope.svg.append("g")
    .attr("class", "brush")
    .call(d3.brushX()
      .extent([
        [scope.margins.left, scope.margins.right],
        [scope.width + scope.margins.right + scope.margins.left, scope.height + scope.margins.top]
      ])
      .on("end", scope.histogramBrush));

}

function appendZoom(scope) {

  function zoomed() {
    if (d3.event.sourceEvent && d3.event.sourceEvent.type === "brush") return; // ignore zoom-by-brush
    var t = d3.event.transform;
    //TODO fazer o zoom com relação ao que?
    scope.chartGroup
      .selectAll("rect.bar")
      .attr("transform", d3.event.transform).attr("d", function(d) {
        return scope.x1Scale(d.key)
      })
      .attr("x", function(d) {
        return scope.x1Scale(d.key);
      });
  }

  scope.zoom = d3.zoom().scaleExtent([1, Infinity])
    .translateExtent([
      [0, 0],
      [scope.width, scope.height]
    ])
    .extent([
      [0, 0],
      [scope.width, scope.height]
    ])
    .on("zoom", zoomed);


  scope.svg.append("rect")
    .attr("class", "zoom")
    .attr("width", scope.width)
    .attr("height", scope.margins.bottom)
    .attr("opacity", 0)
    .attr('transform', 'translate(' + scope.margins.left + ',' + (scope.height + scope.margins.top) + ')')
    .call(scope.zoom);
}


function histogram() {
  var scope = this;
  var exports = {};

  scope.data = undefined;
  scope.margins = undefined
  scope.width = undefined;
  scope.height = undefined;
  scope.xScale = undefined;
  scope.yScale = undefined;
  scope.xAxis = undefined;
  scope.yAxis = undefined;
  scope.brush = undefined;

  exports.run = function(div, resourcePath, setup) {
    scope.div = div;
    scope.margins = setup.margins;
    scope.width = setup.width;
    scope.height = setup.height;
    scope.xAxisName = setup.xAxisName;
    scope.yAxisName = setup.yAxisName;
    scope.x0Scale = undefined;
    scope.x1Scale = undefined;
    scope.y = undefined;
    //scope.histogramBrush = setup.histogramBrush;

    scope.histogramBrush = function() {
      if (!d3.event.sourceEvent) return; // Only transition after input.
      if (!d3.event.selection) {
        scope.svg.selectAll('rect')
          .style("opacity", function(d) {
            return "1";
          });
        return;
      } // Ignore empty selections.

      var s = d3.event.selection;
      var x0 = s[0],
        x1 = s[1];
      scope.svg.selectAll('rect')
        .style("opacity", function(d, i) {
          //TODO como verificar quais retangulos estão dentro do brush
        });
    }

    scope.load = function(error, data) {
      if (error) throw error;

      scope.data = data;
      scope.keys = scope.data.columns.slice(1);

      scope.x0Scale = d3.scaleBand()
        .rangeRound([0, scope.width])
        .paddingInner(0.1);

      scope.x1Scale = d3.scaleBand()
        .padding(0.05);

      scope.y = d3.scaleLinear()
        .rangeRound([scope.height, 0]);

      scope.x0Scale.domain(scope.data.map(function(d) {
        return d.State;
      }));
      scope.x1Scale.domain(scope.keys).rangeRound([0, scope.x0Scale.bandwidth()]);
      scope.y.domain([0, d3.max(scope.data, function(d) {
        return d3.max(scope.keys, function(key) {
          return d[key];
        });
      })]).nice();

      scope.colors = d3.scaleOrdinal()
        .range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);

      scope.svg = appendSvg(scope);
      scope.chartGroup = appendChartGroup(scope);
      appendRect(scope);
      appendAxis(scope);
      scope.legend = appendLegend(scope);
      appendXBrush(scope);
      appendZoom(scope);
    }

    scope.loadCSVData = loadCSVData(resourcePath, scope.load);

  }

  return exports;
}

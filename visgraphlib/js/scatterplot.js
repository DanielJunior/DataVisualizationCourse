'use strict';

function scatterplot() {

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

  scope.appendSvg = function(div) {
    var node = d3.select(div).append('svg')
      .attr('width', scope.width + scope.margins.left + scope.margins.right)
      .attr('height', scope.height + scope.margins.top + scope.margins.bottom);

    return node;
  }

  scope.appendChartGroup = function(svg, clas) {
    var chart = svg.append('g')
      .attr('class', clas)
      .attr('width', scope.width)
      .attr('height', scope.height)
      .attr('transform', 'translate(' + scope.margins.left + ',' + scope.margins.top + ')');

    return chart;
  }

  scope.createAxes = function(svg, xLabel, yLabel) {
    var minX = d3.min(scope.data, function(item){
      return d3.min(item, function(d){
        return d.cx;
      });
    });
    var maxX = d3.max(scope.data, function(item){
      return d3.max(item, function(d){
        return d.cx;
      });
    });
    scope.xScale = d3.scaleLinear().domain([minX,maxX]).range([0, scope.width]);
    scope.tmpxScale = d3.scaleLinear().domain([minX,maxX]).range([0, scope.width]);
    var minY = d3.min(scope.data, function(item){
      return d3.min(item, function(d){
        return d.cy;
      });
    });
    var maxY = d3.max(scope.data, function(item){
      return d3.max(item, function(d){
        return d.cy;
      });
    });

    scope.yScale = d3.scaleLinear().domain([minY,maxY]).range([0, scope.height]);
    scope.tmpyScale = d3.scaleLinear().domain([minY,maxY]).range([0, scope.height]);

    var xAxisGroup = svg.append('g')
      .attr('class', 'xAxis')
      .attr('transform', 'translate(' + scope.margins.left + ',' + (scope.height + scope.margins.top) + ')');

    scope.xAxis = d3.axisBottom(scope.xScale);
    xAxisGroup.call(scope.xAxis);
    svg.append("text")
      .attr("transform",
        "translate(" + (scope.width / 2) + " ," +
        (scope.height + scope.margins.top + 30) + ")")
      .style("text-anheightor", "middle")
      .text(xLabel);

    var yAxisGroup = svg.append('g')
      .attr('class', 'yAxis')
      .attr('transform', 'translate(' + scope.margins.left + ',' + scope.margins.top + ')');
    scope.yAxis = d3.axisLeft(scope.yScale);

    yAxisGroup.call(scope.yAxis);

    svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0)
      .attr("x", 0 - (scope.height / 2))
      .attr("dy", "1em")
      .style("text-anheightor", "middle")
      .text(yLabel);
  }

  scope.appendCircles = function(chart) {

    var transition = d3.transition().duration(750);

    var circlesSelection = chart.selectAll('.chart_group')
                                    .data(scope.data)
                                    .enter()
                                    .append('g')
                                    .attr('class', 'circle_group')
                                    .style('fill', function(data, index){
                                        return scope.colorScale(index);
                                    })
                                    .selectAll(".point")
                                    .data(function(d){
                                            return d;
                                    })
                                    .enter()
                                    .append('circle')
                                    .transition(transition)
                                    .attr("class", "point")
                                    .attr("r", 4.5)
                                    .attr("cx", function(d) { return scope.xScale(d.cx) })
                                    .attr("cy", function(d) { return scope.yScale(d.cy); });
  }

  scope.appendLegend = function(svg, domain) {
    var legendRectSize = 18;
    var legendSpacing = 4;
    var legend = svg.selectAll('.legend')
      .data(domain)
      .enter()
      .append('g')
      .attr('class', 'legend')
      .attr("transform", function(d, i) {
        return "translate(-40," + i * 20 + ")";
      });

    legend.append('rect')
      .attr("x", scope.width - 50)
      .attr("width", 19)
      .attr("height", 19)
      .style('fill', function(d,i) {
        return scope.colorScale(i);
      })
      .style('stroke', function(d) {
        return "";
      });

    legend.append('text')
      .attr("x", scope.width - 24)
      .attr("y", 9.5)
      .attr("dy", "0.32em")
      .text(function(d,i) {
        return domain[i];
      });
  }

  scope.brushAction = function(){
          scope.svg.select('.main_group')
          .selectAll('circle')
            .style("fill", function(d) {
              if (scope.tmpxScale(d.cx) +scope.margins.left  >= scope.brushCoord.x0
                  && scope.tmpxScale(d.cx) +scope.margins.left <= scope.brushCoord.x1
                  && scope.tmpyScale(d.cy) + scope.margins.top >= scope.brushCoord.y0
                  && scope.tmpyScale(d.cy)+ scope.margins.top <= scope.brushCoord.y1) {
                return "black";
              }
            });
  }

  scope.addZoom = function(svg) {
    function zoomedX() {
      var t = d3.event.transform;

      scope.tmpxScale = t.rescaleX(scope.xScale);
      scope.xAxis.scale(scope.tmpxScale);

      var xAxisGroup = svg.select('.xAxis');
      xAxisGroup.call(scope.xAxis);


      svg.select('.main_group')
        .selectAll('circle')
        .attr("cx", function(d) {
          return scope.tmpxScale(d.cx);
        });

        scope.brushAction();
    }

    function zoomedY() {
      var t = d3.event.transform;

      scope.tmpyScale = t.rescaleX(scope.yScale);
      scope.yAxis.scale(scope.tmpyScale);

      var yAxisGroup = svg.select('.yAxis');
      yAxisGroup.call(scope.yAxis);

      svg.select('.main_group')
        .selectAll('circle')
        .attr("cy", function(d) {
          return scope.tmpyScale(d.cy);
        });

        scope.brushAction();

    }

    scope.zoomX = d3.zoom()
      .on("zoom", zoomedX);

    svg.append("rect")
      .attr("class", "zoom")
      .attr("width", scope.width)
      .attr("height", scope.margins.bottom)
      .attr('transform', 'translate(' + scope.margins.left + ',' + (scope.height + scope.margins.top) + ')')
      .call(scope.zoomX);

    scope.zoomY = d3.zoom()
      .on("zoom", zoomedY);

    svg.append("rect")
      .attr("class", "zoom")
      .attr("width", scope.margins.left)
      .attr("height", scope.width)
      .attr('transform', 'translate(0,' + (scope.margins.top) + ')')
      .call(scope.zoomY);
  }

  scope.addBrush = function(svg) {
    function brushed() {
      if (d3.event.sourceEvent && d3.event.sourceEvent.type === "zoom") return; // // ignore brush-by-zoom
      var s = d3.event.selection,
        x0 = s[0][0],
        y0 = s[0][1],
        x1 = s[1][0],
        y1 = s[1][1];

      scope.brushCoord = {};
      scope.brushCoord.x0 = x0;
      scope.brushCoord.x1 = x1;
      scope.brushCoord.y0 = y0;
      scope.brushCoord.y1 = y1;
      scope.brushAction();
    };

    scope.brush = d3.brush()
      .on("end", brushed);

    svg.append("g")
      .attr("class", "brush")
      .call(scope.brush);
  }



  exports.run = function(div, data, setup) {
    scope.data = data;
    scope.width = setup.width;
    scope.height = setup.height;
    scope.margins = setup.margins;
    scope.svg = scope.appendSvg(div);
    scope.createAxes(scope.svg, "X", "Y");
    scope.colorScale = d3.scaleOrdinal(d3.schemeCategory10);
    var mainChartGroup = scope.appendChartGroup(scope.svg, "main_group");
    scope.appendCircles(mainChartGroup);
    var legendChartGroup = scope.appendChartGroup(mainChartGroup, "legend_group");
    scope.appendLegend(legendChartGroup, setup.legends);
    if(setup.brush){
      scope.addBrush(scope.svg);
    }
    if(setup.zoom){
      scope.addZoom(scope.svg);
    }
    return scope.svg;
  }

  return exports;
}

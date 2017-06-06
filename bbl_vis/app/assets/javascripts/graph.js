/**
 * Created by danieljr on 05/06/17.
 */
'use strict';

function graph() {
    var scope = this;
    var exports = {};

    scope.color = d3.scaleSequential(d3.interpolateRainbow);
    // TODO determinação da escala dinamicamente
    scope.color_scale = d3.scaleLinear()
        .range([0, 1])
        .domain([4, 10]);

    scope.appendSVG = function (div, width, height, margins) {
        var svg = d3.select(div).append('svg')
            .attr('width', width + margins.left + margins.right)
            .attr('height', height + margins.top + margins.bottom);

        return svg;
    };

    scope.appendChartGroup = function (svg, width, height, margins) {
        var chart = svg.append('g')
            .attr('width', width)
            .attr('height', height)
            .attr('transform', 'translate(' + margins.left + ',' + margins.top + ')');

        return chart;
    };

    //TODO checar qual melhor força central para o nosso grafo
    scope.createSimulation = function (width, height) {
        var simulation = d3.forceSimulation()
            .force("link", d3.forceLink().id(function (d) {
                return d.id;
            }))
            .force("charge", d3.forceManyBody())
            .force("x", d3.forceX())
            .force("y", d3.forceY())
            .force("center", d3.forceCenter(width / 2, height / 2));
        return simulation;
    };

    scope.appendNodes = function (svg, nodes, color, color_scale) {
        var node = svg.append("g")
            .attr("class", "nodes")
            .selectAll("circle")
            .data(nodes)
            .enter().append("circle")
            .attr("r", function (d) {
                return d.length;
            })
            .attr("fill", function (d) {
                return color(color_scale(d.length));
            });
        // .call(d3.drag()
        //     .on("start", dragstarted)
        //     .on("drag", dragged)
        //     .on("end", dragended));

        node.append("title")
            .text(function (d) {
                return d.id;
            });

        // function dragstarted(d) {
        //     if (!d3.event.active) simulation.alphaTarget(0.3).restart();
        //     d.fx = d.x;
        //     d.fy = d.y;
        // }
        //
        // function dragged(d) {
        //     d.fx = d3.event.x;
        //     d.fy = d3.event.y;
        // }
        //
        // function dragended(d) {
        //     if (!d3.event.active) simulation.alphaTarget(0);
        //     d.fx = null;
        //     d.fy = null;
        // }
        return node;
    };


    scope.appendLinks = function (svg, links) {
        var link = svg.append("g")
            .attr("class", "links")
            .selectAll("line")
            .data(links)
            .enter().append("line")
            .attr("stroke-width", function (d) {
                return 2;
            })
            .style('marker-end', 'url(#mark-end-arrow)');
        return link;
    };

    scope.configSimulation = function (simulation, nodes_data, links_data, node_obj, link_obj) {
        simulation
            .nodes(nodes_data)
            .on("tick", ticked);

        simulation.force("link")
            .links(links_data)
            .distance(function(){return 50;});

        //TODO como determinar onde a aresta deve terminar para que a seta não seja sobreposta pelo nó destino
        //a função como está é uma tentativa de resolver o problema
        function ticked() {
            var source = {};
            link_obj
                .attr("x1", function (d) {
                    source.x = d.source.x;
                    return d.source.x;
                })
                .attr("y1", function (d) {
                    source.y = d.source.y;
                    return d.source.y;
                })
                .attr("x2", function (d) {
                    // if (source.x > d.target.x) {
                    //     return d.target.x - 5;
                    // }
                    return d.target.x;

                })
                .attr("y2", function (d) {
                    // if (source.y > d.target.y) {
                    //     return d.target.y - 5;
                    // }
                    return d.target.y;
                });

            node_obj
                .attr("cx", function (d) {
                    return d.x;
                })
                .attr("cy", function (d) {
                    return d.y;
                });
        }
    };


    exports.run = function (div, setup, url) {

        d3.json(url, function (error, graph) {

            if (error) throw error;
            scope.svg = scope.appendSVG(div, setup.width, setup.height, setup.margins);

            // // define arrow markers for graph links
            // var defs = scope.svg.append('svg:defs');
            // defs.append('svg:marker')
            //     .attr('id', 'end-arrow')
            //     .attr('viewBox', '0 -5 10 10')
            //     .attr('refX', "32")
            //     .attr('markerWidth', 3.5)
            //     .attr('markerHeight', 3.5)
            //     .attr('orient', 'auto')
            //     .append('svg:path')
            //     .attr('d', 'M0,-5L10,0L0,5');
            //
            // // define arrow markers for leading arrow
            // defs.append('svg:marker')
            //     .attr('id', 'mark-end-arrow')
            //     .attr('viewBox', '0 -5 10 10')
            //     .attr('refX', 7)
            //     .attr('markerWidth', 3.5)
            //     .attr('markerHeight', 3.5)
            //     .attr('orient', 'auto')
            //     .append('svg:path')
            //     .attr('d', 'M0,-5L10,0L0,5');


            scope.mainChart = scope.appendChartGroup(scope.svg, setup.width, setup.height, setup.margins);
            scope.simulation = scope.createSimulation(setup.width, setup.height);
            scope.link_obj = scope.appendLinks(scope.svg, graph.links);
            scope.node_obj = scope.appendNodes(scope.svg, graph.nodes, scope.color, scope.color_scale);
            scope.configSimulation(scope.simulation, graph.nodes, graph.links, scope.node_obj, scope.link_obj);

        })
    };

    return exports;

}
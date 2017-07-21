angular.module('module-app').directive('programAnalysis', ['d3Service', 'commonService', '$timeout', function (d3Service, commonService, $timeout) {
    return {
        restrict: 'EA',
        scope: { data: '=' },
        link: function(scope, element, attrs) {
            d3Service.d3().then(function(d3) {
                
                //*************** Start D3 Code ****************

                d3.queue()
                    .defer(d3.csv, scope.data)
                    .await(ready)
                
                function ready(error, datapoints){
                    
                    var width = 850;
                    var height = 475;

                    var svg = d3.select("#chart")
                        .append("svg")
                        .attr("height", height)
                        .attr("width", width)

                    var width = +svg.attr("width"),
                        height = +svg.attr("height"),
                        color = d3.scaleOrdinal(d3.schemeCategory10),
                        mouseIsOver, 
                        areaMultiplier = 1;
                    
                    var nodes = [],
                        links = [];
                    
                    // Construct the Treemap
                    var filtered = datapoints.filter(function(d) {
                            return d['Department'] && d['Room']
                        })
                    
                    var nestedData = d3.nest()
                      .key(function(d) { return d['Department']; })
                      .key(function(d) { return d['Sub-department']; })
                      .key(function(d) { return d['Room']; })
                      .entries(filtered);
                    
                    var root = d3.hierarchy(nestedData);
                    
                    console.log(root);
                    
                    var tree = d3.tree()
                        .size([height, width - 160]);
                    
                    var forceXStart = d3.forceX(function(d){
                        return 0;
                    }).strength(0.05);

                    var forceYStart = d3.forceY(function(d){
                        return 0;
                    }).strength(0.05);
                    
                    var forceXAnalysis1 = d3.forceX(function(d){
                        if (d['Active'] > 3){
                            return ( 0.50 + .05 * d['Active'] ) * width - width / 2
                        } else {
                            return ( .50 -( .05 * ( 7 - d['Active']  ) ) ) * width - width / 2
                        }
                    }).strength(0.3);                

                    var forceXAnalysis2 = d3.forceX(function(d){
                        if (d['Daylight'] > 3){
                            return ( 0.50 + .05 * d['Daylight'] ) * width - width / 2
                        } else {
                            return ( .50 -( .05 * ( 7 - d['Daylight']  ) ) ) * width - width / 2
                        }
                    }).strength(0.3);
                    
                    var colorOverlay = function(d){
                        var overlayScheme = d3.select("#overlay-selector").node().value;
                        
                        var colorScale = d3.scaleSequential(d3.interpolateInferno)
                            .domain([0, 6]);
                        
                        switch(overlayScheme) {
                            case 'program':
                                return d['Color'];
                                break;
                            case 'activity':
                                return colorScale(d['Active']);
                                break;
                            case 'daylight':
                                return colorScale(d['Daylight']);
                                break;
                        }   
                    }
                        
                    var radiusScale = d3.scaleSqrt().domain([1,70000]).range([1,150]);
                    
                    var forceCollide = d3.forceCollide(function(d){
                        return radiusScale(d['Program Area'] * areaMultiplier) + 1
                    });

                    var simulation = d3.forceSimulation(nodes)
//                        .force("link", d3.forceLink(links).distance(200))
                        .force("x", forceXStart)
                        .force("y", forceYStart)
                        .force("collide", forceCollide)
                        .on("tick", ticked);

                    var g = svg.append("g").attr("transform", "translate(" + width / 2 + "," + height / 2 + ")"),
                        link = g.append("g").attr("stroke", "#000").attr("stroke-width", 1.5).selectAll(".link"),
                        node = g.append("g").attr("stroke", "#fff").attr("stroke-width", 1.5).selectAll(".node");

                    restart();

//                    d3.timeout(function() {
//                      links.push({source: a, target: b}); // Add a-b.
//                      links.push({source: b, target: c}); // Add b-c.
//                      links.push({source: c, target: a}); // Add c-a.
//                      restart();
//                    }, 1000);
//
//                    d3.interval(function() {
//                      nodes.pop(); // Remove c.
//                      links.pop(); // Remove c-a.
//                      links.pop(); // Remove b-c.
//                      restart();
//                    }, 2000, d3.now());
//
//                    d3.interval(function() {
//                      nodes.push(c); // Re-add c.
//                      links.push({source: b, target: c}); // Re-add b-c.
//                      links.push({source: c, target: a}); // Re-add c-a.
//                      restart();
//                    }, 2000, d3.now() + 1000);

                    function restart() {
                        
                          var link = svg.selectAll(".link")
                            .data(tree(root).links())
                            .enter().append("path")
                              .attr("class", "link")
                              .attr("d", d3.linkHorizontal()
                                  .x(function(d) { return d.y; })
                                  .y(function(d) { return d.x; }));

                          var node = svg.selectAll(".node")
                            .data(root.descendants())
                            .enter().append("g")
                              .attr("class", function(d) { return "node" + (d.children ? " node--internal" : " node--leaf"); })
                              .attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; })

                          node.append("circle")
                              .attr("r", 2.5);

                          node.append("text")
                              .attr("dy", 3)
                              .attr("x", function(d) { return d.children ? -8 : 8; })
                              .style("text-anchor", function(d) { return d.children ? "end" : "start"; })
                              .text(function(d) { return d.key });
                    }

                    function ticked() {
                      node.attr("cx", function(d) { return d.x; })
                          .attr("cy", function(d) { return d.y; })

//                      link.attr("x1", function(d) { return d.source.x; })
//                          .attr("y1", function(d) { return d.source.y; })
//                          .attr("x2", function(d) { return d.target.x; })
//                          .attr("y2", function(d) { return d.target.y; });
                    }
                    
                    function updateCircleScale(multiplier){
                        node
                        .transition()
                        .duration(2000)
                            .attr("r", function(d){ 
                                return radiusScale(d['Program Area'] * multiplier)
                            });
                    }                    
                    
                    function updateCircleColor(){
                        node
                        .transition()
                        .duration(500)
                            .attr("fill", function(d){ 
                                return colorOverlay(d);
                            });
                    }
                    
                    function dragstarted(d) {
                        d3.select(this).raise().classed("active", true);
                    }

                    function dragged(d) {
                        d3.select(this).select("circle").attr("cx", d.x = d3.event.x).attr("cy", d.y = d3.event.y);

                        simulation
                            .alphaTarget(0)
                            .restart()
                    }

                    function dragended(d) {
                        d3.select(this).classed("active", false);
                    }
                    
                    d3.select("#granularity-selector").on('change', function(){
                        restart();
                    });
                    
                    d3.select("#map1").on('click', function(){
                        areaMultiplier = 1;
                        updateCircleScale(areaMultiplier);

                        simulation
                            .force('x', forceXStart)
                            .force('y', forceYStart)
                            .force("collide", forceCollide)
                            .alphaTarget(0.5)
                            .restart()
                    })

                    d3.select("#map2").on('click', function(){

                        areaMultiplier = 3;
                        updateCircleScale(areaMultiplier);

                        simulation
                            .force('x', forceXStart)
                            .force('y', forceYStart)
                            .force("collide", forceCollide)
                            .alphaTarget(0.5)
                            .restart()
                    })

                    d3.select("#analysis1").on('click', function(){
                        areaMultiplier = 1;
                        updateCircleScale(areaMultiplier);

                        simulation
                            .force('x', forceXAnalysis1)
                            .force('y', forceYStart)
                            .force("collide", forceCollide)
                            .alphaTarget(0.5)
                            .restart()
                    })

                    d3.select("#analysis2").on('click', function(){
                        areaMultiplier = 1;
                        updateCircleScale(areaMultiplier);

                        simulation
                            .force('x', forceXAnalysis2)
                            .force('y', forceYStart)
                            .force("collide", forceCollide)
                            .alphaTarget(0.5)
                            .restart()
                    })
                    
                    // Add overlay listener
                    d3.select("#overlay-selector").on('change', function(){
                        updateCircleColor();
                    });
                    
                    // Toggle children on click.
                    function toggleChildren(d) {
                        console.log('Toggle Children');
    //                    if (d.children) {
    //                        d._children = d.children;
    //                        d.children = null;
    //                    } else {
    //                        d.children = d._children;
    //                        d._children = null;
    //                    }
    //                    
    //                    update();
                    }

                    // Returns a list of all nodes under the root.
                    function flatten(root) {
                      var nodes = [], i = 0;

                      function recurse(node) {
                        if (node.children) node.size = node.children.reduce(function(p, v) { return p + recurse(v); }, 0);
                        if (!node.id) node.id = ++i;
                        nodes.push(node);
                        return node.size;
                      }

                      root.size = recurse(root);
                      return nodes;
                    }
                    
                    
                    
                }
    
                //*************** End D3 Code ****************
                
            });
        }
    }
}]);
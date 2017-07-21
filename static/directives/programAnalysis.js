angular.module('module-app').directive('programAnalysis', ['d3Service', 'commonService', 'userService', '$timeout', function (d3Service, commonService, userService, $timeout) {
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
                    
                    commonService.listen(remoteUpdateObject, 'OBJECT_MOVED', 'mappingCtrl');
                    commonService.listen(emitModelData, 'MODEL_REQUESTED', 'mappingCtrl');
                    
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
                    
                    var isFirstLoad = true;

                    var simulation = d3.forceSimulation(nodes)
//                        .force("link", d3.forceLink(links).distance(200))
                        .force("x", forceXStart)
                        .force("y", forceYStart)
                        .force("collide", forceCollide)
                        .on("tick", ticked)
                        .on("end", function (){
                            if (userService.userList.length > 1 && isFirstLoad) {
                                isFirstLoad = false;
                                var data = {
                                    socketId: userService.userList[0],
                                    projectId: 'Brentwood'
                                }

                                socket.emit('requestModel', data)
                            }
                        });

                    var g = svg.append("g").attr("transform", "translate(" + width / 2 + "," + height / 2 + ")"),
                        link = g.append("g").attr("stroke", "#000").attr("stroke-width", 1.5).selectAll(".link"),
                        node = g.append("g").attr("stroke", "#fff").attr("stroke-width", 1.5).selectAll(".node");
                    
                    var granularity = d3.select("#granularity-selector").node().value;

                    datapoints.forEach(function(d) {
                        if (granularity === 'Room') {
                            if (d['Program Area'] && d['Room']) { 
                                nodes.push(d) 
                            }
                        } else if (granularity === 'Department') {
                            if (d['Program Area'] && d['Department'] && !d['Room']) { 
                                nodes.push(d) 
                            }
                        }
                    })

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

                        // Apply the general update pattern to the nodes.;
                        node = node.data(nodes)
                            .attr("class", "node")
                                .attr("r", function(d){
                                    return radiusScale(d['Program Area'])
                                })
                                .attr("fill", function(d){
                                    return colorOverlay(d)
                                });
                        
                        node.exit().remove();
                        
                        node = node.enter().append("circle")
                            .attr("class", "node")
                            .attr("id", function(d){
                                return 'circle-' + d['id']
                            })
                            .attr("r", function(d){
                                return radiusScale(d['Program Area'])
                            })
                            .attr("fill", function(d){
                                return colorOverlay(d)
                            })
                            .on("mouseover", function(d){
                                mouseIsOver = true;
                                commonService.notify('SHOW_DATA_ITEM', d);
                            })
                            .on("mouseout", function(d){
                                mouseIsOver = false;
                                $timeout(function(){
                                    if (!mouseIsOver) {
                                        commonService.notify('SHOW_DATA_ITEM', null);
                                    }
                                }, 5000)
                            })
                            .call(d3.drag()
                                .on("start", dragstarted)
                                .on("drag", dragged)
                                .on("end", dragended))
                            .merge(node);

//                      // Apply the general update pattern to the links.
//                      link = link.data(links, function(d) { return d.source.id + "-" + d.target.id; });
//                      link.exit().remove();
//                      link = link.enter().append("line").merge(link);

                        // Update and restart the simulation.
                        simulation.nodes(nodes);
//                        simulation.force("link").links(links);
                        simulation.alpha(1).restart();
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
                        emitModelData();
                    }
                    
                    function emitModelData(){
                        socket.emit('updateModel', nodes );
                    }
                    
                    function remoteUpdateObject(objectData) {
//                        nodes.push(objectData)
                        
                        objectData.forEach(function(i){
                            d3.selectAll(".node")
                                .filter(function(d) {
                                    return d['id'] === i.id
                                })
                                .transition()
                                .duration(500)
                                    .attr("cx", function(d){ return d.x = i.x })
                                    .attr("cy", function(d){ return d.y = i.y });
                        })
                        
                        simulation
                            .alphaTarget(0)
                            .restart()
                    }
                    
                    d3.select("#granularity-selector").on('change', function(){
                        nodes = [];
                        
                        granularity = this.value;

                        datapoints.forEach(function(d) {
                            if (granularity === 'Room') {
                                if (d['Program Area'] && d['Room']) { 
                                    nodes.push(d) 
                                }
                            } else if (granularity === 'Department') {
                                if (d['Program Area'] && d['Department'] && !d['Room']) { 
                                    nodes.push(d) 
                                }
                            }
                        })
                        
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
                }
    
                //*************** End D3 Code ****************
                
            });
        }
    }
}]);
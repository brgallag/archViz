angular.module('module-app').directive('voronoi2', ['d3Service', 'commonService', '$timeout', function (d3Service, commonService, $timeout) {
    return {
        restrict: 'EA',
        scope: {},
        link: function(scope, element, attrs) {
            d3Service.d3().then(function(d3) {
                
                //*************** Start D3 Code ****************

                var width = 850;
                var height = 475;
                
                var mouseIsOver;
                
                var svg = d3.select("#chart")
                    .append("svg")
                    .attr("height", height)
                    .attr("width", width)
                    .append("g")
                    .attr("transform", "translate(0,0)")
                
                var forceXStart = d3.forceX(function(d){
                    if(d.area && d.room){ return width/2; }
                }).strength(0.05);
                
                var forceYStart = d3.forceY(function(d){
                    return height/2;
                }).strength(0.05);                
                
                var forceXAnalysis1 = d3.forceX(function(d){
                    if (d.active > 3){
                        return 650
                    } else {
                        return 250
                    }
                }).strength(0.05);                
                
                var forceXAnalysis2 = d3.forceX(function(d){
                    if (d.daylight > 3){
                        return 700
                    } else {
                        return 200
                    }
                }).strength(0.05);
                
                var areaMultiplier = 1;

                var forceCollide = d3.forceCollide(function(d){
                    return radiusScale(d.area * areaMultiplier) + 1
                });
                
                var simulation = d3.forceSimulation()
                    .force("x", forceXStart)
                    .force("y", forceYStart)
                    .force("collide", forceCollide)
                
                var radiusScale = d3.scaleSqrt().domain([1,1500]).range([1,40]);
                
                d3.queue()
                    .defer(d3.csv, "../../uploads/program.csv")
                    .await(ready)
                
                function ready(error, datapoints){
                    var circles = svg.selectAll(".department")
                    .data(datapoints)
                    .enter().append("circle")
                    .filter(function(d){
                        return d.area > 0 && d.room
                    })
                    .attr("class", "department")
                    .attr("r", function(d){
                        return radiusScale(d.area)
                    })
                    .attr("fill", function(d){
                        return d.color;
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
                        .on("end", dragended));
                    
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
                    
                    simulation.nodes(datapoints)
                        .on('tick', ticked)
                    
                    function ticked(){
                        circles
                            .attr("cx", function(d){
                                return d.x    
                            })
                            .attr("cy", function(d){
                                return d.y    
                            })
                    }
                    
                    function updateCircleScale(multiplier){
                            circles
                            .transition()
                            .duration(2000)
                                .attr("r", function(d){ 
                                    return radiusScale(d.area * multiplier)
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

                }          
                
                //*************** End D3 Code ****************
                
            });
        }
    }
}]);
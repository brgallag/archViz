angular.module('module-app').directive('voronoi', ['d3Service', function (d3Service) {
    return {
        restrict: 'EA',
        scope: {},
        link: function(scope, element, attrs) {
            d3Service.d3().then(function(d3) {
                
                var containerElement = document.getElementById('voronoi');

                var svg = d3.select("svg");

                svg.attr("width", containerElement.offsetWidth).attr("height", containerElement.offsetHeight);

                var width = +svg.attr("width");
                var height = +svg.attr("height");

//                var circles = d3.range(20).map(function() {
//                  return {
//                    x: Math.round(Math.random() * (width - radius * 2) + radius),
//                    y: Math.round(Math.random() * (height - radius * 2) + radius)
//                  };
//                });
                
                var circles = [];
                
                d3.csv('../../uploads/program.csv', function(data) {
                     
                    circles = data.map(function(d) { 
                        return { 
                            x: Math.round(Math.random() * (width - +d.size * 2) + +d.size), 
                            y: Math.round(Math.random() * (height - +d.size * 2) + +d.size),
                            size: +d.size,
                            color: d.color
                        }; 
                    });
                    
                    buildCircles();
                });
                
                var color;
                var voronoi;
                var circle;
                var cell;
                
                function buildCircles(){
                    
                    voronoi = d3.voronoi()
                        .x(function(d) { return d.x; })
                        .y(function(d) { return d.y; })
                        .extent([[-1, -1], [width + 1, height + 1]]);

                    circle = svg.selectAll("g")
                      .data(circles)
                      .enter().append("g")
                        .call(d3.drag()
                            .on("start", dragstarted)
                            .on("drag", dragged)
                            .on("end", dragended));

                    cell = circle.append("path")
                      .data(voronoi.polygons(circles))
                        .attr("d", renderCell)
                        .attr("id", function(d, i) { return "cell-" + i; });

                    circle.append("clipPath")
                        .attr("id", function(d, i) { return "clip-" + i; })
                      .append("use")
                        .attr("xlink:href", function(d, i) { return "#cell-" + i; });

                    circle.append("circle")
                        .attr("clip-path", function(d, i) { return "url(#clip-" + i + ")"; })
                        .attr("cx", function(d) { return d.x; })
                        .attr("cy", function(d) { return d.y; })
                        .attr("r", function(d) { return d.size / 10; })
                        .style("fill", function(d) { return d.color; });
                } 

                function dragstarted(d) {
                  d3.select(this).raise().classed("active", true);
                }

                function dragged(d) {
                  d3.select(this).select("circle").attr("cx", d.x = d3.event.x).attr("cy", d.y = d3.event.y);
                  cell = cell.data(voronoi.polygons(circles)).attr("d", renderCell);
                }

                function dragended(d, i) {
                  d3.select(this).classed("active", false);
                }

                function renderCell(d) {
                  return d == null ? null : "M" + d.join("L") + "Z";
                }
                
//                function drawCircle(x, y) {
//                    console.log('Drawing circle at', x, y);
//                    
//                    circles.push({x: x, y: y});
//                    buildCircles();
//                }
//
//                svg.on('dblclick', function() {
//                    var coords = d3.mouse(this);
//                    drawCircle(coords[0], coords[1]);
//                });
                
                window.onresize = function() {
                    containerElement = document.getElementById('voronoi');
                    svg.attr("width", containerElement.offsetWidth);
                    scope.$apply();
                };                
    
            });
        }
    }
}]);
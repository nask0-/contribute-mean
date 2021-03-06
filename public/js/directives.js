window.angular.module('ngff.directives', [])
  .directive('graph', function () {
    return {
      restrict: 'E',
      scope: {
        values: '='
      },
      link: function (scope, element, attrs) {
        scope.$watch('values', function(values) {
          if(values) {  
            
            var width = 360,
            height = 300,
            radius = Math.min(width, height) / 2;
            
            var color = d3.scale.ordinal()
              .range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);
            
            var arc = d3.svg.arc()
              .outerRadius(radius - 10)
              .innerRadius(0);
            
            var pie = d3.layout.pie()
              .sort(null)
              .value(function(d) { 
                return d.score; 
              });
            
            var svg = d3.select(element[0]).append("svg")
              .attr("width", width)
              .attr("height", height)
              .append("g")
              .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");
            
            
            
              values.forEach(function(d) {
                d.score = +d.score;
              });
              
              var g = svg.selectAll(".arc")
                .data(pie(values))
                .enter().append("g")
                .attr("class", "arc");
              
              g.append("path")
                .attr("d", arc)
                .style("fill", function(d) { return color(d.data.name); });
              
              g.append("text")
                .attr("transform", function(d) { return "translate(" + arc.centroid(d) + ")"; })
                .attr("dy", ".35em")
                .style("text-anchor", "middle")
                .text(function(d) { return d.data.name; });

          }
        })
      }
    }
  });
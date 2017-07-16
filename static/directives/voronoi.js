angular.module('module-app').directive('voronoi', ['$parse', function ($parse) {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            console.log('Voronoi Directive');
        }
    };
}]);

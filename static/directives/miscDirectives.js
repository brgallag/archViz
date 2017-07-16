angular.module('module-app').directive('backButton', ['$window', '$rootScope', '$state', function($window, $rootScope, $state) {
    return {
        restrict: 'A',
        link: function (scope, elem, attrs) {
            if ($rootScope.navigatedFrom) {
                elem.bind('click', function () {
                    $window.history.back();
                });
            } else {
                elem.bind('click', function () {
                    $state.go('home');
                });
            }
        }
    };
}]);

angular.module('module-app').directive('autofocus', ['$timeout', function($timeout) {
  return {
    restrict: 'A',
    link : function($scope, $element) {
      $timeout(function() {
        $element[0].focus();
          console.log('autofocus');
      });
    }
  }
}]);

angular.module('module-app').directive('backgroundImg', function(){ //updates background-image css
    return {
        restrict: 'A',
        link: function(scope, element, attrs){
            attrs.$observe('backgroundImg', function(value) {
                element.css({
                    'background-image': 'url(' + value +')'
                });
            });
        }
    }
});

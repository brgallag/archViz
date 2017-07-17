angular.module('module-mapping', [])
.directive('mapping', function () {
	return {
		restrict: 'E',
		replace: false,
		templateUrl: 'modules/mapping/mapping.tmpl.html',
		controller: 'mappingCtrl',
		controllerAs: 'mappingCtrl'
	};
});
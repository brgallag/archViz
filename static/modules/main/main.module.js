angular.module('module-main', [])
.directive('main', function () {
	return {
		restrict: 'E',
		replace: false,
		templateUrl: 'modules/main/main.tmpl.html',
		controller: 'mainCtrl',
		controllerAs: 'mainCtrl'
	};
});

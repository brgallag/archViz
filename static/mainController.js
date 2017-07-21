(function() {
    'use strict';
    angular.module('module-app')
    .controller('mainCtrl', ['commonService', '$rootScope', '$timeout', '$state', '$scope', '$window',
    function (commonService, $rootScope, $timeout, $state, $scope, $window) {
        var vm = this;
        vm.id = 'mainCtrl';
        vm.text = commonService.getText(vm.id);
        vm.config = commonService.getConfig(vm.id);
        
        angular.element($window).on('resize', function(){ $scope.$apply(); });

        commonService.listenMemory(alertState, 'END_STATE_CHANGE', vm.id);

        vm.isMobile = commonService.isMobile.any();
        
        function alertState(){
            vm.state = $state.current.name;
        }
        
        vm.updateToolSet = function(tool) {
            commonService.notify('UPDATE_TOOLSET', tool);
        }
    }]);
})();
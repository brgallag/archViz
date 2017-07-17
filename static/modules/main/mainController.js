(function() {
    'use strict';
    angular.module('module-main')
    .controller('mainCtrl', ['commonService', '$rootScope', '$timeout', '$state',
    function (commonService, $rootScope, $timeout, $state) {
        var vm = this;
        vm.id = 'mainCtrl';
        vm.text = commonService.getText(vm.id);
        vm.config = commonService.getConfig(vm.id);

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
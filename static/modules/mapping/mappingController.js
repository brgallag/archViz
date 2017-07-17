(function() {
    'use strict';
    angular.module('module-mapping')
    .controller('mappingCtrl', ['commonService', '$scope',
    function (commonService, $scope) {
        var vm = this;
        vm.id = 'mappingCtrl';
        vm.text = commonService.getText(vm.id);
        vm.config = commonService.getConfig(vm.id);
        
        commonService.listenMemory(updateToolSet, 'UPDATE_TOOLSET', vm.id);
        commonService.listen(showDataItem, 'SHOW_DATA_ITEM', vm.id);
        
        vm.mapImage = '/images/brentwood-master-plan.JPG';
        vm.toolText = {};
        
        vm.updateToolSet = updateToolSet;
        
        vm.updateToolSet('map1');
                
        function updateToolSet(tool){            
            switch(tool) {
                case 'map1':
                    vm.mapImage = '/images/brentwood-master-plan.jpg';
                    vm.toolText.title = 'Program Mapping | Campus';
                    break;
                case 'map2':
                    vm.mapImage = '/images/brentwood-building-plan.jpg';
                    vm.toolText.title = 'Program Mapping | Departments';
                    break;
                case 'map3':
                    vm.mapImage = '/images/brentwood-building-plan.jpg';
                    vm.toolText.title = 'Program Mapping | Rooms';
                    break;
                case 'analysis1':
                    vm.mapImage = null;
                    vm.toolText.title = 'Program Analysis | Active vs. Passive';
                    vm.toolText.legendLeft = 'Passive';
                    vm.toolText.legendRight = 'Active';
                    break;
                case 'analysis2':
                    vm.mapImage = null;
                    vm.toolText.title = 'Program Analysis | Daylight Entrainment';
                    vm.toolText.legendLeft = 'Less';
                    vm.toolText.legendRight = 'More';
                    break;
            }
        }
        
        function showDataItem(d){
            vm.mappingData = d;
            $scope.$apply();
        }
        
    }]);
})();
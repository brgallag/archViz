(function() {
    'use strict';
    angular.module('module-mapping')
    .controller('mappingCtrl', ['commonService', '$scope',
    function (commonService, $scope) {
        var vm = this;
        vm.id = 'mappingCtrl';
        vm.text = commonService.getText(vm.id);
        vm.config = commonService.getConfig(vm.id);
        
        commonService.listen(updateToolSet, 'UPDATE_TOOLSET', vm.id);
        commonService.listen(showDataItem, 'SHOW_DATA_ITEM', vm.id);
        
        vm.mapImage = '/images/brentwood-master-plan.JPG';
        
        vm.data = '../../uploads/program.csv';
        vm.toolData = {};
        
        vm.updateToolSet = updateToolSet;
        
        vm.updateToolSet('map1');
                
        function updateToolSet(tool){            
            switch(tool) {
                case 'map1':
                    vm.toolData = {
                        type: 'program',
                        mapImage: '/images/brentwood-master-plan.jpg',
                        title: 'Campus',
                        legendLeft: null,
                        legendRight: null
                    }
                    break;
                case 'map2':
                    vm.toolData = {
                        type: 'program',
                        mapImage: '/images/brentwood-building-plan.jpg',
                        title: 'Departments',
                        legendLeft: null,
                        legendRight: null
                    }                    
                    break;
                case 'analysis1':
                    vm.toolData = {
                        type: 'analysis',
                        mapImage: 'null',
                        title: 'Active vs. Passive',
                        legendLeft: 'Passive',
                        legendRight: 'Active'
                    }
                    break;
                case 'analysis2':
                    vm.toolData = {
                        type: 'analysis',
                        mapImage: 'null',
                        title: 'Daylight Entrainment',
                        legendLeft: 'Less',
                        legendRight: 'More'
                    }
                    break;
            }
        }
        
        function showDataItem(d){
            vm.mappingData = d;
            $scope.$apply();
        }
        
    }]);
})();
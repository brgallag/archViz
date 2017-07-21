(function() {
    'use strict';
    angular.module('module-app')
    .service('userService', ['commonService', '$http',
    function (commonService, $http) {

        var service = {
            id: 'userService',
            config: commonService.getConfig('userService'),
            socketId: null,
            userList: []
        }
        
        commonService.listen(updateUserList, 'USER_JOINED', service.id);

        return service;

        function updateUserList(userId){
            service.userList.push(userId);
        }

    }]);
})();
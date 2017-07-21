(function() {
  'use strict';
  angular.module('module-app')
  .service('websocketService', ['commonService', '$http', 'userService',
  function (commonService, $http, userService) {

    var service = {
            id: 'websocketService',
            config: commonService.getConfig('websocketService'),
            socketId: null,
            init: init,
        }

        return service;

        function init () {
            socket.on("socketIdSet", function(data) {
                service.socketId = data.socketId;
                $http.defaults.headers.common['socketId'] = service.socketId;
                for (var i = 0; i < data.sockets.length; i ++){
                    userService.userList.push(data.sockets[i])
                }
                registerSocketListeners();
            });
        }

        function registerSocketListeners () {
            socket.on('userJoined', function(socketId) {
                commonService.notify('USER_JOINED', socketId);
            });
            socket.on('modelUpdated', function(objectData) {
                commonService.notify('OBJECT_MOVED', objectData);
            });
            socket.on('modelRequested', function(data) {
                commonService.notify('MODEL_REQUESTED', data);
            });
        }
  }]);
})();
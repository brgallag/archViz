/* global angular socket navigator */

(function() {
    'use strict';
    angular.module('module-app')
    .service('commonService', ['CONFIG', '$q', '$rootScope', '$location',
    function (CONFIG, $q, $rootScope, $location) {

        /* Public Property and Method references go here */
        var locale = 'en-us';
        var service = {
            observers: {},
            memoryParameters: {},
            locale: locale,
            memoryObservers: {},
            id: 'commonService',
            getQueryStingParam: getQueryStingParam,
            getText: getText,
            getConfig: getConfig,
            $q: $q,
            listen: listen,
            listenMemory: listenMemory,
            getMemory: getMemory,
            notify: notify,
            stopListening: stopListening,
            unregisterAllEventsById: unregisterAllEventsById,
            init: init
        };

        service.isMobile = {
            android: function() {
                return navigator.userAgent.match(/Android/i);
            },
            blackBerry: function() {
                return navigator.userAgent.match(/BlackBerry/i);
            },
            iOS: function() {
                return navigator.userAgent.match(/iPhone|iPad|iPod/i);
            },
            opera: function() {
                return navigator.userAgent.match(/Opera Mini/i);
            },
            windows: function() {
                return navigator.userAgent.match(/IEMobile/i);
            },
            any: function() {
                return (service.isMobile.android() || service.isMobile.blackBerry() || service.isMobile.iOS() || service.isMobile.opera() || service.isMobile.windows());
            }
        };

        return service;
        
        function init(){
            console.log('App Initialized');
        }

        function getText(module) {
            return CONFIG.text[locale][module];
        }

        function getConfig(module) {
            return CONFIG.config[locale][module];
        }

        function getQueryStingParam(param) {
            var ret = null;
            var query = window.location.search.substring(1);
            var vars = query.split('&');
            var l = vars.length;
            for (var i = 0; i < l; i++) {
                var pair = vars[i].split('=');
                if (pair[0] == param) {
                    ret = pair[1];
                }
            }
            return ret;
        }

        /* Using observer pattern over Angular's $emit/$on */
        /* Start listening now and disregard anything that has happend in the past */
        function listen (callback, event, id) {
            if(id) {
                if (!service.observers[event])
                    service.observers[event] = {};
                service.observers[event][id] = [];
                service.observers[event][id].push(callback);
            }
        }

        /* Start listening now and update with the most recent past event data */
        function listenMemory (callback, event, id) {
            listen(callback, event, id);
            if(service.memoryParameters[event]
                    && typeof service.observers[event][id][0] == 'function') {
                service.observers[event][id][0](service.memoryParameters[event]);
            }
        }

        function stopListening (event, id){
            if(service.observers && service.observers[event] && service.observers[event][id]) {
                delete service.observers[event][id];
            }
        }

        function unregisterAllEventsById (id) {
            for (var event in service.observers) {
                if (service.observers[event][id])
                    delete service.observers[event][id];
            }
        }

        function getMemory (event) {
            if(service.memoryParameters[event])
                return service.memoryParameters[event];
            else
                return false;
        }

        function notify (event, parameters) {
            console.log('Event Notification: ' + event);
            if (arguments.length > 1)
                service.memoryParameters[event] = parameters;
            for (var id in service.observers[event]) {
                angular.forEach(service.observers[event][id], function (callback) {
                    callback(parameters);
                });
            }
        }
    }]);
})();
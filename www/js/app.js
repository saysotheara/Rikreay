// This is a JavaScript file

var app = angular.module('main', ['onsen', 'LocalStorageModule', 'mediaPlayer', 'ngCordovaOauth']);

app.config(['$httpProvider', function($httpProvider) {
    $httpProvider.defaults.timeout = 5000;
}]);



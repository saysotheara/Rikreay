// This is a JavaScript file

app.controller('MusicController', ['$rootScope','$scope', 'service', '$controller', 'localStorageService', function($rootScope, $scope, service, $controller, localStorageService) {

    angular.extend(this, $controller('Controller', {$scope: $scope}));

    service.page = 'music';

    $scope.onTopClick = function() {
        $scope.choice = 1;
        if (service.musics_top) {
            $scope.musics_top = service.musics_top;
            $scope.showNoItem = ($scope.musics_top.length === 0) ? true : false;
        }
        else {
            $scope.isLoading = true;
            service.cloudAPI.liveMusicTopList()
                .success( function(result) {
                    $scope.musics_top = result;
                    service.musics_top = result;
                })
                .finally( function() {
                    $scope.isLoading = false;
                    $scope.showNoItem = ($scope.musics_top.length === 0) ? true : false;
                }
            );
        }
    };

    $scope.onFetureClick = function() {
        $scope.choice = 2;
        if (service.musics_feature) {
            $scope.musics_feature = service.musics_feature;
            $scope.showNoItem = ($scope.musics_feature.length === 0) ? true : false;
        }
        else {
            $scope.isLoading = true;
            $scope.showNoItem = false;
            service.cloudAPI.liveMusicFeatureList()
                .success( function(result) {
                    result = $scope.shuffleArray(result).splice(0, 50);
                    $scope.musics_feature = result;
                    service.musics_feature = result;
                })
                .finally( function() {
                    $scope.isLoading = false;
                    $scope.showNoItem = ($scope.musics_feature.length === 0) ? true : false;
                }
            );
        }
    };

    $scope.onNewClick = function() {
        $scope.choice = 3;
        if (service.musics_new) {
            $scope.musics_new = service.musics_new;
            $scope.showNoItem = ($scope.musics_new.length === 0) ? true : false;
        }
        else {
            $scope.isLoading = true;
            service.cloudAPI.liveMusicNewList()
                .success( function(result) {
                    result = $scope.shuffleArray(result).splice(0, 50);
                    $scope.musics_new = result;
                    service.musics_new = result;
                })
                .finally( function() {
                    $scope.isLoading = false;
                    $scope.showNoItem = ($scope.musics_new.length === 0) ? true : false;
                }
            );
        }
    };

    $scope.onFetureClick();
        
}]);


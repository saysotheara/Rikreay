// This is a JavaScript file

app.controller('PromoteController', ['$rootScope', '$scope', 'service', 'localStorageService', function($rootScope, $scope, service, localStorageService) {

    $scope.onTopClick = function() {
        $scope.select = 'top';
        if (service.musics_top) {
            $scope.musics = service.musics_top;
            $scope.showNoItem = ($scope.musics.length === 0) ? true : false;
        }
        else {
            $scope.musics = '';
            $scope.isLoading = true;
            $scope.showNoItem = false;
            service.cloudAPI.liveMusicTopList()
                .success( function(result) {
                    $scope.musics = result;
                    service.musics_top = result;
                })
                .finally( function() {
                    $scope.isLoading = false;
                    $scope.showNoItem = ($scope.musics.length === 0) ? true : false;
                }
            );
        }
    };

    $scope.onFeatureClick = function() {
        $scope.select = 'feature';
        if (service.musics_feature) {
            $scope.musics = service.musics_feature;
            $scope.showNoItem = ($scope.musics.length === 0) ? true : false;
        }
        else {
            $scope.musics = '';
            $scope.isLoading = true;
            $scope.showNoItem = false;
            service.cloudAPI.liveMusicFeatureList()
                .success( function(result) {
                    result = $scope.shuffleArray(result).splice(0, 50);
                    $scope.musics = result;
                    service.musics_feature = result;
                })
                .finally( function() {
                    $scope.isLoading = false;
                    $scope.showNoItem = ($scope.musics.length === 0) ? true : false;
                }
            );
        }
    };
    
    $scope.onNewClick = function() {
        $scope.select = 'new';
        if (service.musics_new) {
            $scope.musics = service.musics_new;
            $scope.showNoItem = ($scope.musics.length === 0) ? true : false;
        }
        else {
            $scope.musics = '';
            $scope.isLoading  = true;
            $scope.showNoItem   = false;
            service.cloudAPI.liveMusicNewList()
                .success( function(result) {
                    result = $scope.shuffleArray(result).splice(0, 50);
                    $scope.musics = result;
                    service.musics_new = result;
                })
                .finally( function() {
                    $scope.isLoading = false;
                    $scope.showNoItem = ($scope.musics.length === 0) ? true : false;
                }
            );
        }
    };
    
    $scope.$on('refresh: loadMusic', function() {
        $scope.grid         = 'hide';
        $scope.choice       = 'top';
        $scope.pageTitle    = '';
        $scope.limitToMusic = 60;
        
        $scope.onFeatureClick();
    });
    
}]);



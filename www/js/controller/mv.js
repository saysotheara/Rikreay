// This is a JavaScript file

app.controller('WatchController', ['$rootScope','$scope', 'service', '$controller', 'localStorageService', function($rootScope, $scope, service, $controller, localStorageService) {
        
    angular.extend(this, $controller('Controller', {$scope: $scope}));

    service.page = 'mv';
    
    $scope.productions = service.productions;

    if (service.mvs) {
        $scope.mvs = service.mvs;
    }
    else {
        $rootScope.$broadcast('refresh: mvs');
    }
    
    $scope.onTopClick = function() {
        $scope.choice = 1;
        if (service.videos_top) {
            $scope.videos_top = service.videos_top;
            $scope.showNoItem = ($scope.videos_top.length === 0) ? true : false;
        }
        else {
            $scope.isLoading = true;
            service.cloudAPI.liveMVTopList()
                .success( function(result) {
                    $scope.videos_top = result;
                    service.videos_top = result;
                })
                .finally( function() {
                    $scope.isLoading = false;
                    $scope.showNoItem = ($scope.videos_top.length === 0) ? true : false;
                }
            );
        }
    };

    $scope.onNewClick = function() {
        $scope.choice = 2;
        if (service.videos_new) {
            $scope.videos_new = service.videos_new;
            $scope.showNoItem = ($scope.videos_new.length === 0) ? true : false;
        }
        else {
            $scope.isLoading = true;
            service.cloudAPI.liveMVNewList()
                .success( function(result) {
                    result = $scope.shuffleArray(result);
                    $scope.videos_new = result;
                    service.videos_new = result;
                })
                .finally( function() {
                    $scope.isLoading = false;
                    $scope.showNoItem = ($scope.videos_new.length === 0) ? true : false;
                }
            );
        }
    };
    
    $scope.onMVClick = function() {
        $scope.choice = 3;
        $scope.showNoItem = false;
        if (service.mvs) {
            $scope.mvs = service.mvs;
            $scope.showNoItem = ($scope.mvs.length === 0) ? true : false;
        }
        else {
            $scope.isLoading = true;
            service.cloudAPI.liveMVList()
                .success( function(result) {
                    $scope.mvs = result;
                    service.mvs = result;
                })
                .finally( function() {
                    $scope.isLoading = false;
                    $scope.showNoItem = ($scope.mvs.length === 0) ? true : false;
                }
            );
        }
    };

    $scope.onMVPlaySelect = function(item) {
        if (navigator.connection.type === Connection.NONE) {
            window.plugins.toast.showShortCenter(service.messageNoInternet);
        }
        else {
            $rootScope.$broadcast('refresh: stopPlayer');
            service.cloudAPI.liveMVDetailViewAdd( { id: item.id, title: item.title, uuid: device.uuid } );
            if (item.other === '') {
                var videoUrl = encodeURI($scope.mvPath + "/" + item.album + "/" + item.url);
                window.plugins.streamingMedia.playVideo(videoUrl, null);
            }
            else {
                YoutubeVideoPlayer.openVideo( item.type );
            }
        }
    };

    $scope.onSeeAllMVClick = function(mv_prod) {
        service.selected_prod = mv_prod;
        $scope.app.slidingMenu.toggleMenu();
        $rootScope.$broadcast('refresh: loadAllMV');
    };

    $scope.onMVSelect = function(item) {
        if (navigator.connection.type === Connection.NONE) {
            window.plugins.toast.showShortCenter(service.messageNoInternet);
        }
        else {
            service.selected_mv = item;
            $scope.app.slidingMenu.toggleMenu();
            $rootScope.$broadcast('refresh: loadMV');
            service.cloudAPI.liveMVViewAdd( { id: item.id, uuid: device.uuid } );
        }
    };
    
    $scope.onNewClick();
    
}]);



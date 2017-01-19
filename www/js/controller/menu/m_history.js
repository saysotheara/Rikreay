// This is a JavaScript file

app.controller('HistoryController', ['$rootScope', '$scope', 'service', 'localStorageService', function($rootScope, $scope, service, localStorageService) {

    $scope.onHistoryClick = function() {
        $scope.select = 'history';
        $scope.limitToMusic = 60;
        $scope.musics = service.musics_history;
        $scope.showNoItem = ($scope.musics.length === 0) ? true : false;
    };
    
    $scope.onRecentClick = function() {
        $scope.select = 'recent';
        $scope.limitToMusic = 60;
        
        $scope.musics = '';
        $scope.isLoading = true;
        $scope.showNoItem = false;
        service.cloudAPI.liveMusicRecentList()
            .success( function(result) {
                $scope.musics = result;
                service.musics_recent = result;
            })
            .finally( function() {
                $scope.isLoading = false;
                $scope.showNoItem = ($scope.musics.length === 0) ? true : false;
            }
        );
    };
    
    $scope.$on('refresh: loadHistory', function() {
        $scope.grid         = 'hide';
        $scope.choice       = 'history';
        $scope.select       = 'history';
        $scope.pageTitle    = '';
        service.filterAlbum = '';
        $scope.limitToMusic = 60;
        $scope.showNoItem   = false;
        service.selectArtist = false;

        if (!service.shouldReload_history && service.musics_history) {
            $scope.musics = service.musics_history;
            $scope.showNoItem = ($scope.musics.length === 0) ? true : false;
            return;
        }
        $scope.musics = '';
        $scope.isLoading  = true;
        service.cloudAPI.liveMusicHistoryList( { uuid : device.uuid } )
            .success( function(result) {
                $scope.musics = result;
                service.musics_history = result;
            })
            .finally( function() {
                $scope.isLoading = false;
                $scope.showNoItem = ($scope.musics.length === 0) ? true : false;
            }
        );
        service.shouldReload_history = false;
    });
    
    $scope.$on('refresh: recents', function() {
        service.cloudAPI.liveMusicRecentList()
            .success( function(result) {
                service.musics_recent = result;
            }
        );
    });

}]);



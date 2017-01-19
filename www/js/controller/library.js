// This is a JavaScript file

app.controller('LibraryController', ['$rootScope','$scope', 'service', '$controller', function($rootScope, $scope, service, $controller) {

    angular.extend(this, $controller('Controller', {$scope: $scope}));

    service.page = 'library';
    $scope.productionPath = service.productionPath;

    $scope.choice = 1;
    
    if (!service.productions) {
        service.cloudAPI.liveProductionList()
            .success( function(result) {
                $scope.albums = result;
                service.productions = result;
            }
        );
    }
    else {
        $scope.albums = service.productions;
    }
        
    $scope.onAlbumClick = function() {
        $scope.choice = 1;
    };

    $scope.onArtistClick = function() {
        $scope.choice = 2;
        $scope.searchQuery = '';
        if (service.artists) {
            $scope.artists = service.artists;
        }
        else {
            $scope.isLoading = true;
            service.cloudAPI.liveArtistList( { filter : "all" } )
                .success( function(result) {
                    $scope.artists = result;
                    service.artists = result;
                })
                .finally( function() {
                    $scope.isLoading = false;
                }
            );
        }
    };
    
    $scope.onAlbumSelect = function(item, index) {
        if (navigator.connection.type === Connection.NONE) {
            window.plugins.toast.showShortCenter(service.messageNoInternet);
            return;
        }
        if (index === 0) {
            service.filterAlbum = '';
        }
        else {
            service.filterAlbum = item.production;
        }
        service.showArtist = false;
        $scope.app.slidingMenu.toggleMenu();
        $rootScope.$broadcast('refresh: loadArtist');
    };

    $scope.onArtistSelect = function(item, index) {
        if (navigator.connection.type === Connection.NONE) {
            window.plugins.toast.showShortCenter(service.messageNoInternet);
            return;
        }
        service.selected_artist = item;
        $scope.app.slidingMenu.toggleMenu();
        $rootScope.$broadcast('refresh: loadFeaturedArtist');
        service.cloudAPI.liveArtistViewAdd( { id: item.id, uuid: device.uuid } );
    };

}]);



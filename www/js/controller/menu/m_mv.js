// This is a JavaScript file

app.controller('MVController', ['$rootScope', '$scope', 'service', 'localStorageService', function($rootScope, $scope, service, localStorageService) {
    
    $scope.$on('refresh: loadMV', function() {
        $scope.grid         = 'hide';
        $scope.choice       = 'mv';
        $scope.select       = 'mv';
        $scope.pageTitle    = service.selected_mv.album;
        $scope.showNoItem   = false;
        $scope.limitToMusic = 60;
        
        $scope.musics = '';        
        $scope.isLoading = true;
        service.cloudAPI.liveMVDetailList( { album : service.selected_mv.album, uuid : device.uuid } )
            .success( function(result) {
                $scope.musics = result;
                service.musics = result;
            })
            .finally( function() {
                $scope.isLoading = false;
                $scope.showNoItem = ($scope.musics.length === 0) ? true : false;
            }
        );
    });
        
    $scope.$on('refresh: loadAllMV', function() {
        $scope.grid = 'show';
        $scope.choice = 'mvs';
        $scope.select = 'mvs';
        $scope.searchBy = 'album';
        $scope.pageTitle = 'Khmer MV - Albums';
        $scope.showSearch = false;
        $scope.isShowGrid = true;
        $scope.limitToNum = 95;
        $scope.searchQuery = '';
        $scope.filterAlbum = service.selected_prod;
        $scope.productions = service.productions;

        if (service.mvs) {
            $scope.mvs = service.mvs;
            $scope.showNoItem = ($scope.mvs.length === 0) ? true : false;
        }
        else {
            $scope.mvs = '';
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
        if (!service.getPopover()) {
            ons.createPopover('popover.html', { parentScope: $scope }).then(function(popover) {
                $scope.popover = popover;
                service.setPopover($scope.popover);
            });
        }
    });

    $scope.onMVAlbumSelect = function(item) {
        if (navigator.connection.type === Connection.NONE) {
            window.plugins.toast.showShortCenter(service.messageNoInternet);
        }
        else {
            service.selected_mv = item;
            service.cloudAPI.liveMVViewAdd( { id: item.id, uuid: device.uuid } );
            service.detail = 'music_by_mv';
            app.navi.pushPage('detail.html');
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

    $scope.onPlayMVClick = function() {
        if ($scope.musics.length === 0) {
            window.plugins.toast.showShortCenter('No music video (MV) to play...');
            return;
        }
        var index = Math.floor(Math.random() * $scope.musics.length);
        $scope.onMVPlaySelect($scope.musics[index]);
    };

    $scope.onLoadMVClick = function() {
        if ($scope.mvs.length > $scope.limitToNum) {
            $scope.limitToNum = $scope.limitToNum + 36;
        }
        else {
            window.plugins.toast.showShortCenter('No more albums to load...');
        }
    };

    $scope.on404MVClick = function() {
        $scope.filterAlbum = '';
    };
    
}]);



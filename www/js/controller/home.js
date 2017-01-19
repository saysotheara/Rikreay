// This is a JavaScript file

app.controller('HomeController', ['$rootScope', '$scope', 'service', '$controller', 'localStorageService', function($rootScope, $scope, service, $controller, localStorageService) {

    angular.extend(this, $controller('Controller', {$scope: $scope}));
    
    if (service.page === undefined) {
        $scope.onRefreshClick();
    }
    else {
        $scope.liveItems = (service.liveItems) ? service.liveItems : '';
        if ($scope.liveItems.length === 0) {
            $scope.onRefreshClick();
        }
    }
    
    service.page = 'home';
    $scope.choice = 'discover';
    
    // Aritsts
    if (service.feature_artists) {
        $scope.feature_artists = service.feature_artists;
    }
    else {
        $rootScope.$broadcast('refresh: feature_artists');
    }

    // Albums
    if (service.new_albums) {
        $scope.new_albums = service.new_albums;
        $scope.cover_albums = service.cover_albums;
        $scope.feature_albums = service.feature_albums;
    }
    else {
        $rootScope.$broadcast('refresh: new_albums');
    }

    // New MV
    if (service.mvs) {
        $scope.mvs = service.mvs;
    }
    else {
        $rootScope.$broadcast('refresh: mvs');
    }

    // Sponsors
    if (service.sponsors) {
        $scope.sponsors = service.sponsors;
    }
    else {
        service.cloudAPI.liveSponsorList()
            .success( function(result){
                $scope.sponsors = result;
                service.sponsors = result;
            }
        );
    }

    $scope.onArtistSelect = function(item) {
        if (navigator.connection.type === Connection.NONE) {
            window.plugins.toast.showShortCenter(service.messageNoInternet);
            return;
        }
        service.selected_artist = item;
        $scope.app.slidingMenu.toggleMenu();
        $rootScope.$broadcast('refresh: loadFeaturedArtist');
        service.cloudAPI.liveArtistViewAdd( { id: item.id, uuid: device.uuid } );
    };

    $scope.onNewAlbumSelect = function (item) {
        if (navigator.connection.type === Connection.NONE) {
            window.plugins.toast.showShortCenter(service.messageNoInternet);
            return;
        }
        service.selected_album = item;
        $scope.app.slidingMenu.toggleMenu();
        $rootScope.$broadcast('refresh: loadNewAlbum');
        service.cloudAPI.liveAlbumViewAdd( { id: item.id, uuid: device.uuid } );
    };

    $scope.onNewMVSelect = function(item) {
        if (navigator.connection.type === Connection.NONE) {
            window.plugins.toast.showShortCenter(service.messageNoInternet);
            return;
        }
        service.selected_mv = item;
        $scope.app.slidingMenu.toggleMenu();
        $rootScope.$broadcast('refresh: loadMV');
        service.cloudAPI.liveMVViewAdd( { id: item.id, uuid: device.uuid } );
    };

    $scope.onSeeAllAlbumClick = function() {
        if (navigator.connection.type === Connection.NONE) {
            window.plugins.toast.showShortCenter(service.messageNoInternet);
            return;
        }
        service.showArtist = false;
        service.filterAlbum = '';
        $scope.app.slidingMenu.toggleMenu();
        $rootScope.$broadcast('refresh: loadArtist');
    };

    $scope.onSeeAllArtistClick = function() {
        if (navigator.connection.type === Connection.NONE) {
            window.plugins.toast.showShortCenter(service.messageNoInternet);
            return;
        }
        service.showArtist = true;
        service.filterAlbum = '';
        $scope.app.slidingMenu.toggleMenu();
        $rootScope.$broadcast('refresh: loadArtist');
    };

    $scope.onSeeAllMVClick = function() {
        if (navigator.connection.type === Connection.NONE) {
            window.plugins.toast.showShortCenter(service.messageNoInternet);
            return;
        }
        $scope.app.slidingMenu.toggleMenu();
        $rootScope.$broadcast('refresh: loadAllMV');
    };

    $scope.onSeeAllTVClick = function() {
        if (navigator.connection.type === Connection.NONE) {
            window.plugins.toast.showShortCenter(service.messageNoInternet);
            return;
        }
        $scope.app.slidingMenu.toggleMenu();
        $rootScope.$broadcast('refresh: loadAllTV');
    };

    $scope.onSeeAllRadioClick = function() {
        if (navigator.connection.type === Connection.NONE) {
            window.plugins.toast.showShortCenter(service.messageNoInternet);
            return;
        }
        $scope.app.slidingMenu.toggleMenu();
        $rootScope.$broadcast('refresh: loadAllRadio');
    };

    $scope.onSeeAllMusicClick = function() {
        if (navigator.connection.type === Connection.NONE) {
            window.plugins.toast.showShortCenter(service.messageNoInternet);
            return;
        }
        $scope.mainTab.setActiveTab(3);
    };
    
    $scope.onDiscoverClick = function() {
        $scope.choice = "discover";
    };

    $scope.$on('refresh: onDiscoverTabClick', function(){
        $scope.onDiscoverClick();
    });

    $scope.onForYouClick = function() {
        $scope.choice = "for_you";
        if (service.musics_for_you) {
            $scope.musics_for_you = service.musics_for_you;
            $scope.showNoItem = ($scope.musics_for_you.length === 0) ? true : false;
        }
        else {
            $scope.isLoading = true;
            $scope.musics_for_you = '';
            service.cloudAPI.liveMusicForYouList( { uuid : device.uuid } )
                .success( function(result) {
                    result = $scope.shuffleArray(result).splice(0, 50);
                    $scope.musics_for_you = result;
                    service.musics_for_you = result;
                })
                .finally( function() {
                    if ($scope.musics_for_you.length > 10) {
                        $scope.isLoading = false;
                        $scope.showNoItem = ($scope.musics_for_you.length === 0) ? true : false;
                    }
                    else {
                        service.cloudAPI.liveMusicNewList()
                            .success( function(result) {
                                result = $scope.shuffleArray(result).splice(0, 50);
                                $scope.musics_for_you = result;
                                service.musics_for_you = result;
                            })
                            .finally( function() {
                                $scope.isLoading = false;
                                $scope.showNoItem = ($scope.musics_for_you.length === 0) ? true : false;
                            }
                        );
                    }
                }
            );
        }
    };

    $scope.onLiveItemSelect = function(live) {
        if (navigator.connection.type === Connection.NONE) {
            window.plugins.toast.showShortCenter(service.messageNoInternet);
            return;
        }
        if (live.type !== 'archive') {
            $rootScope.$broadcast('refresh: stopPlayer');
            service.cloudAPI.liveViewAdd( { id: live.id, uuid: device.uuid } );
        }
        if (live.type === 'tv' || live.type === 'air') {
            var videoUrl = live.url;
            var options = {
                successCallback: function() {
                },
                errorCallback: function(errMsg) {
                    window.plugins.toast.showShortCenter('Unable to play. Please try again later.');
                }
            };
            window.plugins.streamingMedia.playVideo(videoUrl, options);
        }
        else if (live.type.indexOf("youtube") > -1) {
            YoutubeVideoPlayer.openVideo(live.url);
        }
        else if (live.type === 'archive') {
            service.liveItem = live;
            $scope.app.slidingMenu.toggleMenu();
            $rootScope.$broadcast('refresh: loadArchive');
        }
        else {
            var audioUrl = live.url;
            var options = {
                bgColor: "#28292a",
                bgImage: $scope.viewPath + '/' + live.thumb,
                bgImageScale: "center",
                successCallback: function() {
                },
                errorCallback: function(errMsg) {
                    window.plugins.toast.showShortCenter('Unable to play. Please try again later.');
                }
            };
            window.plugins.streamingMedia.playAudio(audioUrl, options);
        }
    };
    
}]);



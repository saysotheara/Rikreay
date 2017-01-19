// This is a JavaScript file

app.controller('MenuMusicController', ['$rootScope','$scope', 'service', 'localStorageService', function($rootScope, $scope, service, localStorageService) {

    var message = 'Playing: ';

    $scope.formatNumber = function(n) {
        var ranges = [
            { divider: 1e18 , suffix: 'P' },
            { divider: 1e15 , suffix: 'E' },
            { divider: 1e12 , suffix: 'T' },
            { divider: 1e9 , suffix: 'G' },
            { divider: 1e6 , suffix: 'M' },
            { divider: 1e3 , suffix: 'k' }
        ];
        
        for (var i = 0; i < ranges.length; i++) {
            if (n >= ranges[i].divider) {
            return (n / ranges[i].divider).toFixed(1) + ranges[i].suffix;
            }
        }
        return n.toString();
    };

    $scope.formatFileSize = function(fileSizeInBytes) {
        var i = -1;
        var byteUnits = [' kB', ' MB', ' GB', ' TB', 'PB', 'EB', 'ZB', 'YB'];
        do {
            fileSizeInBytes = fileSizeInBytes / 1024;
            i++;
        } while (fileSizeInBytes > 1024);
        return Math.max(fileSizeInBytes, 0.1).toFixed(1) + byteUnits[i];
    };
    
    $scope.mvPath    = service.mvPath;
    $scope.viewPath  = service.viewPath;
    $scope.thumbPath = service.thumbPath;
    $scope.seriePath = service.seriePath;
    $scope.musicPath = service.musicPath;
    $scope.artistPath = service.artistPath;
    $scope.messageNoMusic = service.messageNoMusic;

    /*
    Music Player
    */
    $scope.isDownloading = (service.n_download === 0) ? false : true;
    $scope.$on('refresh: download_changed', function(){
        $scope.isDownloading = (service.n_download === 0) ? false : true;
        if (!$scope.app.slidingMenu.isMenuOpened()) {
            $scope.$apply();
        }
    });
    
    $scope.musicNow = (service.playedMusic) ? service.playedMusic : '';
    if (service.mediaPlayer && $scope.detail !== undefined) {
        $scope.player = service.mediaPlayer;
    }
    $scope.$on('refresh: nowPlaying', function(){
        if (service.mediaPlayer) {
            $scope.player = service.mediaPlayer;
        }
        $scope.musicNow = service.playedMusic;
        $scope.musicNow_index = service.music_playlists.indexOf(service.playedMusic);
    });
    $scope.$on('refresh: nextPlaying', function(){
        $scope.musicNow = service.playedMusic;
        $scope.musicNow_index = service.music_playlists.indexOf(service.playedMusic);
    });
    
    $scope.onMusicSelect = function(item, itemIndex) {
        if (navigator.connection.type === Connection.NONE) {
            var playlist = [];
            var items = $scope.musics;
            for( i=0; i<=items.length-1; i++) {
                items[i].src = encodeURI(cordova.file.dataDirectory + 'MUSIC/' + items[i].url);
                playlist.push( items[i] );
            }
            window.resolveLocalFileSystemURL(cordova.file.dataDirectory + 'MUSIC/' + item.url, 
                function (fileSystem) {
                    if (fileSystem.isFile) {
                        service.track = itemIndex;
                        service.music_playlists = playlist;
                        service.playedMusic = items[service.track];
                        if (!service.showPlayer && !service.play_exception) {
                            service.play_exception = true;
                        }
                        $rootScope.$broadcast('refresh: showPlayer');
                        $rootScope.$broadcast('refresh: reloadPlaylist');
                        $rootScope.$broadcast('refresh: musicSelected');
                        window.plugins.toast.showShortCenter("Loading: " + item.title);
                    }
                }, 
                function (error) {
                    window.plugins.toast.showShortCenter("Not found..., please download again.");
                }
            );
            return;
        }
        
        var playlist = [];
        var items = $scope.musics;
        for( i=0; i<=items.length-1; i++) {
            items[i].src = ($scope.choice==='download' || ($scope.choice==='playlist_detail' && service.playlist_mode === 'offline') ) ? encodeURI(cordova.file.dataDirectory + 'MUSIC/' + items[i].url) : encodeURI($scope.musicPath + "/" + items[i].album + "/" + items[i].url);
            playlist.push( items[i] );
        }
        if (items[itemIndex].src.indexOf('superean.com') > -1 && navigator.connection.type === Connection.NONE) {
            window.plugins.toast.showShortCenter(service.messageNoInternet);
            return;
        }
        if (items[itemIndex].src.indexOf('superean.com') === -1) {
            window.resolveLocalFileSystemURL(cordova.file.dataDirectory + 'MUSIC/' + item.url, 
                function (fileSystem) {
                    if (fileSystem.isFile) {
                        service.track = itemIndex;
                        service.music_playlists = playlist;
                        service.playedMusic = items[service.track];
                        if (!service.showPlayer && !service.play_exception) {
                            service.play_exception = true;
                        }
                        $rootScope.$broadcast('refresh: showPlayer');
                        $rootScope.$broadcast('refresh: reloadPlaylist');
                        $rootScope.$broadcast('refresh: musicSelected');
                        window.plugins.toast.showShortCenter("Loading: " + item.title);
                    }
                }, 
                function (error) {
                    window.plugins.toast.showShortCenter("Not found..., please download again.");
                }
            );
        }
        else {
            service.track = itemIndex;
            service.music_playlists = playlist;
            service.playedMusic = items[service.track];
            $rootScope.$broadcast('refresh: showPlayer');
            $rootScope.$broadcast('refresh: reloadPlaylist');
            $rootScope.$broadcast('refresh: musicSelected');
            window.plugins.toast.showShortCenter("Loading: " + item.title);
        }
    };

    $scope.onMusicPlay = function() {
        if ($scope.musics.length === 0) {
            window.plugins.toast.showShortCenter('No music to play...');
            return;
        }
        var index = Math.floor(Math.random() * $scope.musics.length);
        $scope.onMusicSelect($scope.musics[index], index);
    };
    
    $scope.onButtonClick = function(live, itemIndex) {
        if ($scope.choice === 'offline' && navigator.connection.type === Connection.NONE) {
            var callback = function(index) {
                if (index == 1) {
                    service.selected_music = live;
                    $rootScope.$broadcast('event: onOfflinePlaylistMusicAdd');
                }
            };
            var options = {
                'title' : live.title,
                'androidTheme': window.plugins.actionsheet.ANDROID_THEMES.THEME_HOLO_LIGHT,
                'buttonLabels': ['Add to Offline Playlist..'],
                'androidEnableCancelButton' : true,
                'addCancelButtonWithLabel': 'Cancel',
                'position': [20, 40]
            };
            window.plugins.actionsheet.show(options, callback);
            return;
        }
        
        var callback = function(index) {
            if (index == 1) {
                if (service.showPlayer) {
                    // Add to Music Player
                    var playlist = service.music_playlists;
                    for( var i = 0; i < playlist.length; i++) {
                        if (playlist[i].id === live.id) {
                            window.plugins.toast.showShortCenter('Already added to music player...');
                            return;
                        }
                    }
                    if ($scope.detail === undefined) {
                        live.src = ($scope.choice==='download') ? encodeURI(cordova.file.dataDirectory + 'MUSIC/' + live.url) : encodeURI($scope.musicPath + "/" + live.album + "/" + live.url);
                    }
                    else {
                        live.src = ($scope.detail==='playlist_offline') ? encodeURI(cordova.file.dataDirectory + 'MUSIC/' + live.url) : encodeURI($scope.musicPath + "/" + live.album + "/" + live.url);
                    }
                    playlist.push( live );
                    service.music_playlists = playlist;
                    $rootScope.$broadcast('refresh: reloadPlaylist');
                    window.plugins.toast.showShortCenter('Added to music player...');
                }
                else {
                    // play music
                    service.play_exception = true;
                    $scope.onMusicSelect(live, itemIndex);
                }
            }
            else if (index == 2) {
                if (buttonFavorite === 'Add to My Music') {
                    service.saved_music = live;
                    $rootScope.$broadcast('event: onMyMusicAdd');
                }
                else {
                    // Remove music from favorite
                    service.cloudAPI.liveMusicSaveDelete( { music_id : live.id, uuid : device.uuid } )
                        .success( function(result){
                            if ($scope.musics_favorite && $scope.musics_favorite.length > 0) {
                                $scope.musics_favorite.splice(itemIndex, 1);
                                $scope.showNoItem = ($scope.musics_favorite.length === 0) ? true : false;
                            }
                            else {
                                $scope.musics.splice(itemIndex, 1);
                                $scope.showNoItem = ($scope.musics.length === 0) ? true : false;
                            }
                            window.plugins.toast.showShortCenter('Removed song from my music.');
                        }
                    );
                }
            }
            // Add to My Playlist
            else if (index == 3) {
                if (buttonPlaylist === 'Add to My Playlist..') {
                    service.selected_music = live;
                    $rootScope.$broadcast('event: onPlaylistMusicAdd');
                }
                else if (buttonPlaylist === 'Remove from Playlist') {
                    service.selected_music = live;
                    $rootScope.$broadcast('event: onPlaylistMusicDelete');
                }
                else if (buttonPlaylist === 'Add to Offline Playlist..') {
                    service.selected_music = live;
                    $rootScope.$broadcast('event: onOfflinePlaylistMusicAdd');
                }
                else if (buttonPlaylist === 'Remove from Offline Playlist') {
                    $scope.musics.splice(itemIndex, 1);
                    $scope.showNoItem = ($scope.musics.length === 0) ? true : false;
                    $scope.$apply();
                    localStorageService.set('offline_playlists_' + service.selected_playlist.id, $scope.musics);
                    window.plugins.toast.showShortCenter('Removed song from playlist.');
                }
            }
            // Download this Music
            else if (index == 4 && service.showTV) {
                if (buttonDownload === 'Download this Music') {
                    $scope.onDownloadMusicAdd( live );
                }
                else {
                    $scope.onDownloadMusicDelete( live, itemIndex );
                }
            }
        };

        var buttonMusic = 'Play this Music';
        var buttonFavorite = 'Add to My Music';
        var buttonPlaylist = 'Add to My Playlist..';
        var buttonDownload = 'Download this Music';
        if (service.showPlayer) {
            buttonMusic = 'Add to Up Next';
        }
        if ($scope.choice === 'favorite') {
            if ($scope.select === 'favorite') {
                buttonFavorite = 'Remove from My Music';
            }
        }
        if (live.playlist_id) {
            buttonPlaylist = 'Remove from Playlist';
        }
        if ($scope.choice === 'download') {
            buttonPlaylist = 'Add to Offline Playlist..';
            buttonDownload = 'Delete from My Device';
        }
        if ($scope.choice === 'playlist_detail' && service.playlist_mode == 'offline') {
            buttonPlaylist = 'Remove from Offline Playlist';
            buttonDownload = 'Delete from My Device';
        }
        var options = {
            'title' : live.title,
            'androidTheme': window.plugins.actionsheet.ANDROID_THEMES.THEME_HOLO_LIGHT,
            'buttonLabels': [buttonMusic, buttonFavorite, buttonPlaylist, buttonDownload],
            'androidEnableCancelButton' : true,
            'addCancelButtonWithLabel': 'Cancel',
            'position': [20, 40]
        };
        if (!service.showTV) {
            options = {
                'title' : live.title,
                'androidTheme': window.plugins.actionsheet.ANDROID_THEMES.THEME_HOLO_LIGHT,
                'buttonLabels': [buttonMusic, buttonFavorite, buttonPlaylist],
                'androidEnableCancelButton' : true,
                'addCancelButtonWithLabel': 'Cancel',
                'position': [20, 40]
            };
        };
        window.plugins.actionsheet.show(options, callback);
    };

    $scope.onLoadMusicClick = function() {
        if ($scope.choice === 'playlist') {
            $scope.musics = $scope.music_playlists;
        }
        if ($scope.musics.length > $scope.limitToMusic) {
            $scope.limitToMusic = $scope.limitToMusic + 30;
        }
        else {
            window.plugins.toast.showShortCenter('No more music to load...');
        }
    };

    // Music Player at the bottom toolbar
    $scope.showPlayer = (service.showPlayer) ? service.showPlayer : false;
    $scope.$on('refresh: showPlayer', function() {
        $scope.showPlayer = true;
    });

    $scope.showTV = (service.showTV) ? service.showTV : false;
    $scope.$on('refresh: showTV', function() {
        $scope.showTV = true;
    });

    $scope.isStarting = (service.isStarting) ? service.isStarting : false;
    $scope.$on('refresh: streaming', function() {
        $scope.isStarting = service.isStarting;
    });

    $scope.onPlayPrevious = function() {
        $rootScope.$broadcast('event: onPlayPrevious');
    };

    $scope.onPlayNext = function() {
        $rootScope.$broadcast('event: onPlayNext');
    };

    $scope.onFavoriteClick = function() {
        if (navigator.connection.type === Connection.NONE) {
            service.selected_music = $scope.musicNow;
            $rootScope.$broadcast('event: onOfflinePlaylistMusicAdd');
            return;
        }
        var callback = function(index) {
            if (index == 1) {
                var data = { 
                    music_id  : $scope.musicNow.id,
                    title     : $scope.musicNow.title,
                    uuid      : device.uuid
                };
                $scope.isHearting = true;
                service.cloudAPI.liveMusicSaveAdd( data )
                    .finally( function() {
                        $scope.isHearting = false;
                        service.shouldReload_favorite = true;
                        window.plugins.toast.showShortCenter('Added to my music.');
                    }
                );
            }
            else if (index == 2) {
                service.selected_music = $scope.musicNow;
                if (buttonPlaylist === 'Add to My Playlist..') {
                    $rootScope.$broadcast('event: onPlaylistMusicAdd');
                }
                else {
                    $rootScope.$broadcast('event: onOfflinePlaylistMusicAdd');
                }
            }
        };
        var buttonFavorite = 'Add to My Music';
        var buttonPlaylist = 'Add to My Playlist..';
        if ($scope.musicNow.src.indexOf('superean.com') === -1) {
            var buttonPlaylist = 'Add to Offline Playlist..';
        }
        var options = {
                'title' : $scope.musicNow.title,
                'androidTheme': window.plugins.actionsheet.ANDROID_THEMES.THEME_HOLO_LIGHT,
                'buttonLabels': [buttonFavorite, buttonPlaylist],
                'androidEnableCancelButton' : true,
                'addCancelButtonWithLabel': 'Cancel',
                'position': [20, 40]
        };
        window.plugins.actionsheet.show(options, callback);
    };
    
    $scope.onDownloadClick = function() {
        if (navigator.connection.type === Connection.NONE) {
            window.plugins.toast.showShortCenter(service.messageNoInternet);
            return;
        }
        service.downloadedMusic = $scope.musicNow;
        if ($scope.detail) {
            $scope.onDownloadMusicAdd(service.downloadedMusic);
            return;
        }
        $rootScope.$broadcast('event: onDownloadMusicAdd');
    };

    $scope.onUnlinkClick = function() {
        if (navigator.connection.type === Connection.NONE) {
            window.plugins.toast.showShortCenter(service.messageNoInternet);
        }
    };
    
}]);

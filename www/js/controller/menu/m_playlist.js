// This is a JavaScript file

app.controller('MyPlaylistController', ['$rootScope', '$scope', 'service', 'localStorageService', function($rootScope, $scope, service, localStorageService) {

    //Playlist in the main tab
    $scope.$on('LOAD_PLAYLIST_DETAIL', function() {
        $scope.grid         = 'hide';
        $scope.choice       = 'playlist_detail';
        $scope.pageTitle    = service.selected_playlist.name;
        $scope.musics = '';
        $scope.limitToMusic = 60;
        
        if (service.playlist_mode === 'online') {
            $scope.isLoading = true;
            $scope.showNoItem = false;
            service.cloudAPI.liveMusicPlaylistDetailList( { playlist_id : service.selected_playlist.id } )
                .success( function(result){
                    $scope.musics = result;
                })
                .finally( function() {
                    $scope.isLoading = false;
                    $scope.showNoItem = ($scope.musics.length === 0) ? true : false;
                }
            );
            $scope.isOnline = (navigator.connection.type === Connection.NONE) ? false : true;            
        }
        if (service.playlist_mode === 'offline') {
            if (navigator.connection.type === Connection.NONE) {
                $scope.choice = 'offline';
            }
            $scope.musics = service.getLocalStorageItems('offline_playlists_' + service.selected_playlist.id);
            $scope.showNoItem = ($scope.musics.length === 0) ? true : false;
        }
    });

    $scope.$on('ACTION_PLAYLIST_UPDATED', function() {
        $scope.pageTitle = service.selected_playlist.name;
    });

    $scope.onPlaylistSettingClick = function() {
        var item = service.selected_playlist;
        var callback = function(index) {
            if (index == 1) {
                //rename playlist
                $scope.show('update_playlist.html');
                $rootScope.$broadcast('CHANGE_PLAYLIST_MODE');
            }
            else if (index == 2) {
                //delete playlist
                if (service.playlist_mode === 'online') {
                    service.cloudAPI.liveMusicPlaylistDelete( { name: item.name, uuid: device.uuid } )
                        .success( function(result) {
                            $rootScope.$broadcast('ACTION_PLAYLIST_DELETED');
                            $scope.app.slidingMenu.toggleMenu();
                        }
                    );
                }
                if (service.playlist_mode === 'offline') {
                    $rootScope.$broadcast('ACTION_PLAYLIST_DELETED');
                    $scope.app.slidingMenu.toggleMenu();
                }
            }
        };
        var options = {
            'title' : item.name,
            'androidTheme' : window.plugins.actionsheet.ANDROID_THEMES.THEME_HOLO_LIGHT,
            'buttonLabels': ['Rename playlist...', 'Delete this playlist'],
            'androidEnableCancelButton' : true,
            'addCancelButtonWithLabel': 'Cancel',
            'position': [20, 40]
        };
        window.plugins.actionsheet.show(options, callback);        
    };

    $scope.$on('event: onPlaylistMusicDelete', function() {
        var item = service.selected_music;
        var itemIndex = $scope.musics.indexOf(item);
        service.cloudAPI.liveMusicPlaylistDetailDelete( { music_id: item.id, playlist_id: item.playlist_id, uuid: device.uuid } )
            .success( function(result) {
                $scope.musics.splice(itemIndex, 1);
                $scope.showNoItem = ($scope.musics.length === 0) ? true : false;
                window.plugins.toast.showShortCenter('Removed from playlist.');
            })
            .error( function() {
                window.plugins.toast.showShortCenter('Failed to remove from playlist.');
            }
        );
    });

    $scope.$on('event: onPlaylistMusicAdd', function() {
        if (navigator.connection.type === Connection.NONE) {
            window.plugins.toast.showShortCenter(service.messageNoInternet);
            return;
        }
        service.playlist_mode = 'online';
        if (service.playlists_online && service.playlists_online.length > 0) {
            $scope.show('playlists_online.html');
            $rootScope.$broadcast('CHANGE_PLAYLIST_MODE');
            return;
        }
        service.cloudAPI.liveMusicPlaylistList( { uuid: device.uuid } )
            .success( function(result) {
                service.playlists_online = result;
            })
            .finally( function() {
                if (service.playlists_online.length === 0) {
                    service.isAddToMyPlaylist = true;
                    $scope.show('new_playlist.html');
                    $rootScope.$broadcast('CHANGE_PLAYLIST_MODE');
                }
                else {
                    $scope.show('playlists_online.html');
                }
            }
        );
    });
    
    $scope.$on('event: onOfflinePlaylistMusicAdd', function() {
        service.playlist_mode = 'offline';
        var offline_playlists = service.getLocalStorageItems('offline_playlists');
        if (offline_playlists.length === 0) {
            service.isAddToMyPlaylist = true;
            $scope.show('new_playlist.html');
            $rootScope.$broadcast('CHANGE_PLAYLIST_MODE');
        }
        else {
            $scope.show('playlists_offline.html');
        }
    });

    $scope.$on('event: onOfflinePlaylistMusicDelete', function() {
        if (service.deleted_music === 'all') {
            var offline_playlists = service.getLocalStorageItems('offline_playlists');
            for(i=0; i<offline_playlists.length; i++) {
                localStorageService.remove('offline_playlists_' + offline_playlists[i].id);
            }
        }
        else {
            var offline_playlists = service.getLocalStorageItems('offline_playlists');
            for(i=0; i<offline_playlists.length; i++) {
                var offline_playlists_detail = service.getLocalStorageItems('offline_playlists_' + offline_playlists[i].id);
                for(j=0; j<offline_playlists_detail.length; j++) {
                    if (offline_playlists_detail[j].id === service.deleted_music.id) {
                        offline_playlists_detail.splice(j, 1);
                        localStorageService.set('offline_playlists_' + offline_playlists[i].id, offline_playlists_detail);
                        break;
                    }
                }
            }
        }
    });

    $scope.$on('refresh: loadMyPlaylist', function() {
        $scope.grid         = 'hide';
        $scope.choice       = 'my_playlist';
        $scope.select       = 'my_playlist';
        $scope.pageTitle    = 'My Music Playlist';
        $scope.showNoItem   = false;
        
        if (service.my_playlists) {
            $scope.my_playlists = service.my_playlists;
            $scope.showNoItem = ($scope.my_playlists.length === 0) ? true : false;
            
            $scope.feature_playlists = '';
            if (service.feature_playlists) {
                $scope.feature_playlists = service.feature_playlists;
            }
            else {
                service.cloudAPI.liveMusicPlaylistFeatureList()
                    .success( function(result) {
                        $scope.feature_playlists = result;
                        service.feature_playlists = result;
                    }
                );
            }
            return;
        }
        
        $scope.my_playlists = '';
        $scope.isLoading  = true;
        service.cloudAPI.liveMusicPlaylistList( { uuid: device.uuid } )
            .success( function(result) {
                $scope.my_playlists = result;
                service.my_playlists = result;
            })
            .finally( function() {
                $scope.isLoading = false;
                $scope.showNoItem = ($scope.my_playlists.length === 0) ? true : false;
            }
        );
        
        $scope.feature_playlists = '';
        service.cloudAPI.liveMusicPlaylistFeatureList()
            .success( function(result) {
                $scope.feature_playlists = result;
            }
        );        
    });



    /*
        Now Playlist controller
    */
    
    $scope.isRepeat  = true;
    $scope.isShuffle = false;
    $scope.isStarting = false;
    
    $scope.$on('refresh: loadPlaylist', function() {
        $scope.grid         = 'hide';
        $scope.choice       = 'playlist';
        $scope.select       = 'playlist';
        $scope.pageTitle    = 'ស្ដាប់កំសាន្ត';
        $scope.isChecking   = false;
        $scope.limitToMusic = 30;
        service.selectArtist = false;
        $scope.music_playlists = service.music_playlists;
        $scope.switchIcon = 'list-alt';
    });

    $scope.$on('refresh: reloadPlaylist', function() {
        $scope.isRepeat  = false;
        $scope.isShuffle = false;
        service.isRepeat  = $scope.isRepeat;
        service.isShuffle = $scope.isShuffle;
    });

    $scope.onPlaylistSelect = function(item, itemIndex) {
        if (item.src.indexOf('superean.com') === -1) {
            window.resolveLocalFileSystemURL(cordova.file.dataDirectory + 'MUSIC/' + item.url, 
                function (fileSystem) {
                    if (fileSystem.isFile) {
                        service.track = itemIndex;
                        service.playedMusic = item;
                        $scope.musicNow = service.playedMusic;
                        $rootScope.$broadcast('refresh: musicSelected');
                        $scope.isStarting = true;
                        setTimeout(function(){
                            $scope.isStarting = false;
                        }, 1000);
                    }
                }, 
                function (error) {
                    window.plugins.toast.showShortCenter("Not found..., please download again.");
                }
            );
        }
        else {
            service.track = itemIndex;
            service.playedMusic = item;
            $scope.musicNow = service.playedMusic;
            $rootScope.$broadcast('refresh: musicSelected');
            $scope.isStarting = true;
            setTimeout(function(){
                $scope.isStarting = false;
            }, 1500);
        }
    };

    $scope.onShuffleClick = function() {
        $scope.isShuffle = !$scope.isShuffle;
        service.isShuffle = $scope.isShuffle;
        
        if ($scope.isShuffle) {
            $scope.music_playlists = $scope.shuffleArray($scope.music_playlists);
        }
        else {
            $scope.music_playlists = service.music_playlists;
        }
        $scope.musicNow_index = $scope.music_playlists.indexOf(service.playedMusic);
        
        if ($scope.isShuffle) {
            window.plugins.toast.showShortCenter('Shuffle Music : ON');
        }
        else {
            window.plugins.toast.showShortCenter('Shuffle Music : OFF');
        }
    };

    $scope.onRepeatClick = function() {
        $scope.isRepeat = !$scope.isRepeat;
        service.isRepeat = $scope.isRepeat;
        
        if ($scope.isRepeat) {
            window.plugins.toast.showShortCenter('Repeat Music : ON');
        }
        else {
            window.plugins.toast.showShortCenter('Repeat Music : OFF');
        }
    };
    
    $scope.onSwitchPlayerClick = function() {
        $scope.switchIcon = ($scope.switchIcon === 'music') ? 'list-alt' : 'music';
    };

    $scope.onAddToPlaylistClick = function() {
        service.selected_music = $scope.musicNow;
        if ($scope.musicNow.src.indexOf('superean') > -1) {
            $rootScope.$broadcast('event: onPlaylistMusicAdd');
        }
        else {
            $rootScope.$broadcast('event: onOfflinePlaylistMusicAdd');
        }
    };
    
    $scope.onButtonClick_playlist = function(item, itemIndex) {
        if (navigator.connection.type === Connection.NONE) {
            var callback_offline = function(index) {
                if (index == 1) {
                    if (item.id === $scope.musicNow.id) {
                        window.plugins.toast.showShortCenter('Playing: ' + item.title + ' => cannot remove...');
                    }
                    else {
                        $scope.music_playlists.splice(itemIndex, 1);
                        window.plugins.toast.showShortCenter('Removed from playlist.');
                    }
                }
                else if (index == 2) {
                    service.selected_music = item;
                    $rootScope.$broadcast('event: onOfflinePlaylistMusicAdd');
                }
            };
            var options_offline = {
                'title' : item.title,
                'androidTheme' : window.plugins.actionsheet.ANDROID_THEMES.THEME_HOLO_LIGHT,
                'buttonLabels': ['Remove this Music', 'Add to Offline Playlist..'],
                'androidEnableCancelButton' : true,
                'addCancelButtonWithLabel': 'Cancel',
                'position': [20, 40]
            };
            window.plugins.actionsheet.show(options_offline, callback_offline);
            return;
        };
        
        var callback = function(index) {
            if (index == 1) {
                if (item.id === $scope.musicNow.id) {
                    window.plugins.toast.showShortCenter('Playing: ' + item.title + ' => cannot remove...');
                }
                else {
                    $scope.music_playlists.splice(itemIndex, 1);
                    window.plugins.toast.showShortCenter('Removed from playlist.');
                }
            }
            else if (index == 2) {
                service.saved_music = item;
                $rootScope.$broadcast('event: onMyMusicAdd');
            }
            else if (index == 3) {
                service.selected_music = item;
                if (buttonPlaylist === 'Add to My Playlist..') {
                    $rootScope.$broadcast('event: onPlaylistMusicAdd');
                }
                else {
                    $rootScope.$broadcast('event: onOfflinePlaylistMusicAdd');
                }
            }
            else if (index == 4 && item.src.indexOf('superean.com') > -1 && service.showTV) {
                service.downloadedMusic = item;
                $rootScope.$broadcast('event: onDownloadMusicAdd');
            }
        };
        var buttonFavorite = 'Add to My Music';
        var buttonPlaylist = 'Add to My Playlist..';
        var buttonDownload = 'Download this Music';
        var options = {
            'title' : item.title,
            'androidTheme' : window.plugins.actionsheet.ANDROID_THEMES.THEME_HOLO_LIGHT,
            'buttonLabels': ['Remove this Music', buttonFavorite, buttonPlaylist, buttonDownload],
            'androidEnableCancelButton' : true,
            'addCancelButtonWithLabel': 'Cancel',
            'position': [20, 40]
        };
        if (!service.showTV) {
            options = {
                'title' : item.title,
                'androidTheme' : window.plugins.actionsheet.ANDROID_THEMES.THEME_HOLO_LIGHT,
                'buttonLabels': ['Remove this Music', buttonFavorite, buttonPlaylist],
                'androidEnableCancelButton' : true,
                'addCancelButtonWithLabel': 'Cancel',
                'position': [20, 40]
            };
        }
        if (item.src.indexOf('superean.com') === -1) {
            var buttonPlaylist = 'Add to Offline Playlist..';
            options = {
                'title' : item.title,
                'androidTheme' : window.plugins.actionsheet.ANDROID_THEMES.THEME_HOLO_LIGHT,
                'buttonLabels': ['Remove this Music', buttonFavorite, buttonPlaylist],
                'androidEnableCancelButton' : true,
                'addCancelButtonWithLabel': 'Cancel',
                'position': [20, 40]
            };
        }
        window.plugins.actionsheet.show(options, callback);
    };
    
    $scope.dialogs = {};
    $scope.show = function(dlg) {
        if (!$scope.dialogs[dlg]) {
            ons.createDialog(dlg).then(function(dialog) {
                $scope.dialogs[dlg] = dialog;
                dialog.show();
            });
        }
        else {
            $scope.dialogs[dlg].show();
        }
    };
    
    
    // Offline Mode - Playlist detail
    $scope.onButtonClick_Offline = function(item, itemIndex) {
        var callback = function(index) {
            if (index == 1) {
                if (service.showPlayer) {
                    // Add to Music Player
                    var playlist = service.music_playlists;
                    for( var i = 0; i < playlist.length; i++) {
                        if (playlist[i].id === item.id) {
                            window.plugins.toast.showShortCenter('Already added to music player...');
                            return;
                        }
                    }
                    item.src = encodeURI(cordova.file.dataDirectory + 'MUSIC/' + item.url);
                    playlist.push( item );
                    service.music_playlists = playlist;
                    $rootScope.$broadcast('refresh: reloadPlaylist');
                    window.plugins.toast.showShortCenter('Added to music player...');
                }
                else {
                    service.play_exception = true;
                    $scope.onMusicSelect(item, itemIndex);
                }
            }
            // Remove from Offline Playlist
            else if (index == 2) {
                if (buttonPlaylist === 'Remove from Offline Playlist') {
                    $scope.musics.splice(itemIndex, 1);
                    $scope.showNoItem = ($scope.musics.length === 0) ? true : false;
                    localStorageService.set('offline_playlists_' + service.selected_playlist.id, $scope.musics);
                    window.plugins.toast.showShortCenter('Removed from offline playlist.');
                    $scope.$apply();
                }
                else {
                    service.selected_music = item;
                    service.playlist_mode = 'offline';
                    service.offline_playlists = service.getLocalStorageItems('offline_playlists');
                    if (service.offline_playlists.length === 0) {
                        service.isAddToMyPlaylist = true;
                        $scope.show('new_playlist.html');
                    }
                    else {
                        $scope.show('playlists_offline.html');
                    }                    
                    $rootScope.$broadcast('CHANGE_PLAYLIST_MODE');
                }
            }
            // Delete from My Device
            else if (index == 3) {
                $scope.musics.splice(itemIndex, 1);
                $scope.showNoItem = ($scope.musics.length === 0) ? true : false;
                var offline_musics = service.getLocalStorageItems('offline_musics');
                for(i=0; i<offline_musics.length; i++) {
                    if (offline_musics[i].id === item.id) {
                        offline_musics.splice(i, 1);
                        localStorageService.set('offline_musics', offline_musics);
                        break;
                    }
                }
                var offline_playlists = service.getLocalStorageItems('offline_playlists');
                for(i=0; i<offline_playlists.length; i++) {
                    var offline_playlists_detail = service.getLocalStorageItems('offline_playlists_' + offline_playlists[i].id);
                    for(j=0; j<offline_playlists_detail.length; j++) {
                        if (offline_playlists_detail[j].id === item.id) {
                            offline_playlists_detail.splice(j, 1);
                            localStorageService.set('offline_playlists_' + offline_playlists[i].id, offline_playlists_detail);
                            break;
                        }
                    }
                }
                service.musics = service.getLocalStorageItems('offline_musics');
                $scope.$apply();
                window.resolveLocalFileSystemURL(cordova.file.dataDirectory + 'MUSIC/', 
                    function (fileSystem) {
                        fileSystem.getFile(item.url, {create: false}, 
                            function (fileEntry) {
                                fileEntry.remove(
                                    function () {
                                        window.plugins.toast.showShortCenter('Deleted song.');
                                    }, 
                                    function (error) {}
                                );
                            }, 
                            function (error) {}
                        );
                    }, 
                    function (error) {} 
                );
            }
        };

        var buttonMusic = 'Play this Music';
        var buttonPlaylist = 'Remove from Offline Playlist';
        var buttonDownload = 'Delete from My Device';
        if (service.showPlayer) {
            buttonMusic = 'Add to Up Next';
        }
        if (service.page === 'offline_search') {
            var buttonPlaylist = 'Add to Offline Playlist..';
        }
        var options = {
            'title' : item.title,
            'androidTheme': window.plugins.actionsheet.ANDROID_THEMES.THEME_HOLO_LIGHT,
            'buttonLabels': [buttonMusic, buttonPlaylist, buttonDownload],
            'androidEnableCancelButton' : true,
            'addCancelButtonWithLabel': 'Cancel',
            'position': [20, 40]
        };
        
        window.plugins.actionsheet.show(options, callback);
    };
    
}]);


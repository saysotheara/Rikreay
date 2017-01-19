// This is a JavaScript file

app.controller('PlaylistController', ['$rootScope','$scope', 'service', '$controller', 'localStorageService', function($rootScope, $scope, service, $controller, localStorageService) {

    angular.extend(this, $controller('Controller', {$scope: $scope}));

    service.page = 'playlist';
    service.playlist_mode = 'online';
    $scope.productionPath = service.productionPath;

    $scope.choice = 1;
    
    if (!service.playlists_online) {
        $scope.isLoading  = true;
        service.cloudAPI.liveMusicPlaylistList( { uuid: device.uuid } )
            .success( function(result) {
                $scope.playlists_online = result;
                service.playlists_online = result;
            })
            .finally( function() {
                $scope.isLoading = false;
                $scope.showNoItem = ($scope.playlists_online.length === 0) ? true : false;
            }
        );
    }
    else {
        $scope.playlists_online = service.playlists_online;
    }
        
    $scope.$on('ACTION_PLAYLIST_DELETED', function() {
        if (service.playlist_mode === 'online') {
            $scope.playlists_online.splice(service.selected_playlist_index, 1);
            service.playlists_online = $scope.playlists_online;
        }
        if (service.playlist_mode === 'offline') {
            $scope.playlists_offline.splice(service.selected_playlist_index, 1);
            service.playlists_offline = $scope.playlists_offline;
            localStorageService.set('offline_playlists', $scope.playlists_offline);
            
            // delete all musics in the playlist also.
            localStorageService.remove('offline_playlists_' + service.selected_playlist.id);
            $scope.$apply();
        }
        window.plugins.toast.showShortCenter("Deleted playlist.");
    });

    $scope.$on('ACTION_PLAYLIST_ADDED', function() {
        if (service.playlist_mode === 'online') {
            $scope.playlists_online = service.playlists_online;
        }
        if (service.playlist_mode === 'offline') {
            $scope.playlists_offline = service.getLocalStorageItems('offline_playlists');
        }
    });

    $scope.onOnlineClick = function() {
        $scope.choice = 1;
    };

    $scope.onOfflineClick = function() {
        $scope.choice = 2;
        $scope.playlists_offline = service.getLocalStorageItems('offline_playlists');
    };
    
    $scope.onNewPlaylstClick = function() {
        if ($scope.choice === 1) {
            service.playlist_mode = 'online';
        }
        else {
            service.playlist_mode = 'offline';
        }
        $scope.show('new_playlist.html');
        $rootScope.$broadcast('CHANGE_PLAYLIST_MODE');
    };

    $scope.onPlaylistSelect = function(item, index, mode) {
        if (mode === 'online') {
            if (navigator.connection.type === Connection.NONE) {
                window.plugins.toast.showShortCenter(service.messageNoInternet);
                return;
            }
        }
        service.playlist_mode = mode;
        service.selected_playlist = item;
        service.selected_playlist_index = index;
        $scope.app.slidingMenu.toggleMenu();
        $rootScope.$broadcast('LOAD_PLAYLIST_DETAIL');
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

}]);


app.controller('DialogPlaylistController', ['$rootScope', '$scope', 'service', 'localStorageService', function($rootScope, $scope, service, localStorageService) {

    $scope.$on('CHANGE_PLAYLIST_MODE', function() {
        $scope.playlist_mode = service.playlist_mode;
    });

    $scope.required = 'none';
    $scope.playlist_name = '';

    $scope.playlist_mode = service.playlist_mode;
    $scope.playlists_online = service.playlists_online;
    $scope.playlists_offline = service.getLocalStorageItems('offline_playlists');

    $scope.onPlaylistSelect = function(item, index) {
        var music = {
            id          : service.selected_music.id,
            title       : service.selected_music.title,
            title_en    : service.selected_music.title_en,
            artist      : service.selected_music.artist,
            artist_en   : service.selected_music.artist_en,
            url         : service.selected_music.url,
            thumb       : service.selected_music.thumb,
            album       : service.selected_music.album,
            type        : service.selected_music.type,
            view        : service.selected_music.view,
            liked       : service.selected_music.liked,
            download    : service.selected_music.download,
            size        : service.selected_music.size,
            playlist_id : item.id,
            uuid        : device.uuid,
            offline     : 'true'
        };
        if ($scope.playlist_mode === 'offline') {
            var offline_playlist_detail = service.getLocalStorageItems('offline_playlists_' + item.id);
            if (offline_playlist_detail.length === 0) {
                offline_playlist_detail = [];
            }
            var isMusicExist = false;
            for(i=0; i<offline_playlist_detail.length; i++) {
                if (offline_playlist_detail[i].id === service.selected_music.id) {
                    window.plugins.toast.showShortCenter('Already added to playlist.');
                    isMusicExist = true;
                    break;
                }
            }
            if (!isMusicExist) {
                offline_playlist_detail.splice(0, 0, music);
                service.selected_playlist_id = item.id;
                localStorageService.set('offline_playlists_' + item.id, offline_playlist_detail);
                $rootScope.$broadcast('refresh: added_to_my_playlist_done');
                window.plugins.toast.showShortCenter('Added song to playlist.');
            }
        }
        else {
            music = {
                music_id    : service.selected_music.id,
                playlist_id : item.id,
                uuid        : device.uuid
            };
            service.cloudAPI.liveMusicPlaylistDetailAdd( music )
                .success( function(result) {
                    service.selected_playlist_id = item.id;
                    $rootScope.$broadcast('refresh: added_to_my_playlist_done');
                    window.plugins.toast.showShortCenter('Added song to playlist.');
                })
                .error( function() {
                    window.plugins.toast.showShortCenter('Already added to playlist.');
                }
            );
        }
        $scope.dialog.hide();
    };

    var generateUid = function (separator) {
        var delim = separator || "-";
        function S4() {
            return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
        }
        return (S4() + S4() + delim + S4() + delim + S4() + delim + S4() + delim + S4() + S4() + S4());
    };

    $scope.onCreateClick = function() {
        if ($scope.playlist_name.length >= 2 && $scope.playlist_name.length <= 20) {
            if (service.playlist_mode === 'offline') {
                var isPlaylistExist = false;
                $scope.playlists_offline = service.getLocalStorageItems('offline_playlists');
                for(i=0; i<$scope.playlists_offline.length; i++) {
                    if ($scope.playlists_offline[i].name === $scope.playlist_name) {
                        window.plugins.toast.showShortCenter('Playlist already exists...');
                        isPlaylistExist = true;
                        break;
                    }
                }
                if (!isPlaylistExist) {
                    var playlist = {
                        id      : generateUid(),
                        uuid    : device.uuid, 
                        name    : $scope.playlist_name 
                    };
                    if ($scope.playlists_offline.length === 0) {
                        $scope.playlists_offline = [];
                    }
                    $scope.dialog_new.hide();
                    $scope.playlists_offline.push(playlist);
                    localStorageService.set('offline_playlists', $scope.playlists_offline);
                    $rootScope.$broadcast('ACTION_PLAYLIST_ADDED');
                    
                    if (service.isAddToMyPlaylist) {
                        $scope.onPlaylistSelect(playlist, 0);
                    }
                }
            }
            else {
                service.cloudAPI.liveMusicPlaylistAdd( { name: $scope.playlist_name, uuid: device.uuid } )
                    .success( function(result) {
                        var playlist = {
                            id      : result, 
                            uuid    : device.uuid, 
                            name    : $scope.playlist_name 
                        };
                        if ($scope.playlists_online.length === 0) {
                            $scope.playlists_online = [];
                        }
                        $scope.dialog_new.hide();
                        $scope.playlists_online.push(playlist);
                        service.playlists_online = $scope.playlists_online;
                        $rootScope.$broadcast('ACTION_PLAYLIST_ADDED');
                        // if (service.isAddToMyPlaylist) {
                        //     $scope.onPlaylistSelect(playlist, 0);
                        // }
                    })
                    .error( function() {
                        window.plugins.toast.showShortCenter('Playlist already exists...');
                    }
                );
            }
        }
        else {
            $scope.required = 'true';
            $scope.playlist_name = '';
            window.plugins.toast.showShortCenter('Please enter a valid playlist name...');
        }
    };

    $scope.onUpdateClick = function() {
        if ($scope.new_playlist_name.length >= 2 && $scope.new_playlist_name.length <= 20) {
            if (service.playlist_mode === 'offline') {
                var isPlaylistExist = false;
                service.playlists_offline = service.getLocalStorageItems('offline_playlists');;
                for(i=0; i<service.playlists_offline.length; i++) {
                    if (service.playlists_offline[i].name === $scope.new_playlist_name) {
                        window.plugins.toast.showShortCenter('Playlist already exists...');
                        isPlaylistExist = true;
                        break;
                    }
                }
                if (!isPlaylistExist) {
                    service.playlists_offline[service.selected_playlist_index].name = $scope.new_playlist_name;
                    localStorageService.set('offline_playlists', service.playlists_offline);
                    
                    service.selected_playlist.name = $scope.new_playlist_name;
                    $rootScope.$broadcast('ACTION_PLAYLIST_UPDATED');
                    $scope.dialog_update.hide();
                }
                return;
            }
            service.cloudAPI.liveMusicPlaylistUpdate( { id: service.selected_playlist.id, name: $scope.new_playlist_name, uuid: device.uuid } )
                .success( function(result) {
                    service.selected_playlist.name = $scope.new_playlist_name;
                    $rootScope.$broadcast('ACTION_PLAYLIST_UPDATED');
                    $scope.dialog_update.hide();
                })
                .error( function() {
                    window.plugins.toast.showShortCenter('Playlist already exists...');
                }
            );
        }
        else {
            $scope.required = 'true';
            $scope.new_playlist_name = '';
            window.plugins.toast.showShortCenter('Not a valid playlist...');
        }
    };

    $scope.onFocus = function() {
        $scope.required = 'none';
    };

    $scope.onDialogHide = function() {
        $scope.required = 'none';
        $scope.playlist_name = '';
    };

    $scope.onDialogShow = function() {
        $scope.required = 'none';
        $scope.new_playlist_name = '';
        $scope.playlist_name = service.selected_playlist.name;
        $scope.playlist_mode = service.playlist_mode;
        $scope.playlists_offline = service.getLocalStorageItems('offline_playlists');
    };

}]);



// This is a JavaScript file

app.controller('OfflineController_main', ['$rootScope','$scope', 'service', 'localStorageService', function($rootScope, $scope, service, localStorageService) {

    $scope.onMusicSelect = function(item, itemIndex) {
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
                }
            }, 
            function (error) {
                window.plugins.toast.showShortCenter("Not found..., please download again.");
            }
        );
    };

    $scope.onMusicPlay = function() {
        if ($scope.musics.length === 0) {
            window.plugins.toast.showShortCenter('No music to play...');
            return;
        }
        var index = Math.floor(Math.random() * $scope.musics.length);
        $scope.onMusicSelect($scope.musics[index], index);
    };
    
    $scope.onButtonClick = function(item, itemIndex) {
        var callback = function(index) {
            if (index == 1) {
                if (service.showPlayer) {
                    // add to Music Player
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
                    // play music
                    $scope.onMusicSelect(item, itemIndex);
                }
            }
            // Add to Offline Playlist..
            else if (index == 2) {
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
            // Delete this Music
            else if (index == 3) {
                $scope.musics.splice(itemIndex, 1);
                localStorageService.set('offline_musics', $scope.musics);
                $scope.showNoItem = ($scope.musics.length === 0) ? true : false;
                $scope.$apply();
                
                service.deleted_music = item;
                $rootScope.$broadcast('event: onOfflinePlaylistMusicDelete');

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
        var buttonPlaylist = 'Add to Offline Playlist..';
        var buttonDownload = 'Delete from My Device';
        if (service.showPlayer) {
            buttonMusic = 'Add to Up Next';
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
    
    $scope.onLoadMusicClick = function() {
        if ($scope.musics.length > $scope.limitToMusic) {
            $scope.limitToMusic = $scope.limitToMusic + 30;
        }
        else {
            window.plugins.toast.showShortCenter('No more music to load...');
        }
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

app.controller('OfflineController_music', ['$rootScope','$scope', 'service', '$controller', 'localStorageService', function($rootScope, $scope, service, $controller, localStorageService) {

    angular.extend(this, $controller('Controller', {$scope: $scope}));

    service.page = 'offline_music';
    
    $scope.limitToMusic = 60;
    $scope.musics = service.getLocalStorageItems('offline_musics');
    $scope.showNoItem = ($scope.musics.length === 0) ? true : false;
    
    angular.extend(this, $controller('OfflineController_main', {$scope: $scope}));

}]);

app.controller('OfflineController_history', ['$rootScope','$scope', 'service', '$controller', 'localStorageService', function($rootScope, $scope, service, $controller, localStorageService) {

    angular.extend(this, $controller('Controller', {$scope: $scope}));

    service.page = 'offline_history';

    $scope.limitToMusic = 60;
    $scope.musics = service.getLocalStorageItems('offline_history');
    if ($scope.musics.length > 0) {
        $scope.musics = $scope.musics.reverse();
    }
    $scope.showNoItem = ($scope.musics.length === 0) ? true : false;

    angular.extend(this, $controller('OfflineController_main', {$scope: $scope}));

}]);

app.controller('OfflineController_search', ['$rootScope','$scope', 'service', '$filter', '$controller', 'localStorageService', function($rootScope, $scope, service, $filter, $controller, localStorageService) {

    angular.extend(this, $controller('Controller', {$scope: $scope}));

    service.page = 'offline_search';

    $scope.musics       = '';
    $scope.searchText   = '';
    $scope.showNoItem   = false;
    $scope.limitToMusic = 60;

    $scope.$watch('searchText', function (value) {
        if (value) {
            $scope.musics = $filter('filter')( service.getLocalStorageItems('offline_musics'), {'title': value} );
            $scope.showNoItem = ($scope.musics && $scope.musics.length === 0) ? true : false;
        }
    });

    angular.extend(this, $controller('OfflineController_main', {$scope: $scope}));

}]);


app.controller('OfflineController_playlist', ['$rootScope','$scope', 'service', '$controller', 'localStorageService', function($rootScope, $scope, service, $controller, localStorageService) {

    angular.extend(this, $controller('Controller', {$scope: $scope}));

    service.page = 'offline_playlist';
    service.playlist_mode = 'offline';

    $scope.playlists = service.getLocalStorageItems('offline_playlists');
    $scope.showNoItem = ($scope.playlists.length === 0) ? true : false;

    $scope.$on('ACTION_PLAYLIST_ADDED', function() {
        $scope.playlists = service.getLocalStorageItems('offline_playlists');
        $scope.showNoItem = ($scope.playlists.length === 0) ? true : false;
        $scope.$apply();
    });

    $scope.$on('ACTION_PLAYLIST_DELETED', function() {
        $scope.playlists.splice(service.selected_playlist_index, 1);
        localStorageService.set('offline_playlists', $scope.playlists);

        // delete all musics in the playlist also.
        localStorageService.remove('offline_playlists_' + service.selected_playlist.id);
        $scope.$apply();
        
        window.plugins.toast.showShortCenter("Deleted playlist.");
    });

    $scope.onOfflinePlaylistAdd = function() {
        service.isAddToMyPlaylist = false;
        $scope.show('new_playlist.html');
        $rootScope.$broadcast('CHANGE_PLAYLIST_MODE');
    };

    $scope.onOfflinePlaylistSelect = function(item, itemIndex) {
        service.selected_playlist = item;
        service.selected_playlist_index = itemIndex;
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

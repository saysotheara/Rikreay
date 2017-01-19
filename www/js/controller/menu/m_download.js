// This is a JavaScript file

app.controller('DownloadController', ['$rootScope', '$scope', '$filter', 'service', 'localStorageService', function($rootScope, $scope, $filter, service, localStorageService) {

    $scope.isDownloading = false;

    function checkDownloaded(music) {
        var isAlreadyDownload = false;
        var offline_musics = service.getLocalStorageItems('offline_musics');
        for(i=0; i<offline_musics.length; i++) {
            if (offline_musics[i].id === music.id) {
                isAlreadyDownload = true;
                break;
            }
        }
        return isAlreadyDownload;
    }
    function checkQueueDownload(music) {
        var isAlreadyDownload = false;
        var queue = service.getLocalStorageItems('download_queue');
        for(i=0; i<queue.length; i++) {
            if (queue[i].id === music.id) {
                isAlreadyDownload = true;
                break;
            }
        }
        return isAlreadyDownload;
    }
    function addQueueDownload(music) {
        var queue = service.getLocalStorageItems('download_queue');
        if (queue.length === 0) {
            queue = [];
        }
        queue.push(music);
        localStorageService.set('download_queue', queue);
    }
    function removeQueueDownload(music) {
        var queue = service.getLocalStorageItems('download_queue');
        for(i=0; i<queue.length; i++) {
            if (queue[i].id === music.id) {
                queue.splice(i, 1);
                break;
            }
        }
        localStorageService.set('download_queue', queue);
    }
    
    $scope.onDownloadMusicAdd = function( live ) {
        if (navigator.connection.type === Connection.NONE) {
            window.plugins.toast.showShortCenter(service.messageNoInternet);
            return;
        }
        window.resolveLocalFileSystemURL(cordova.file.dataDirectory, 
            function (fileSystem) {
                fileSystem.getDirectory('MUSIC', { create: true, exclusive: false }, null, null);
            }, null
        );

        if (checkDownloaded(live)) {
            window.plugins.toast.showShortCenter('Already downloaded: ' + live.title);
        }
        else if (checkQueueDownload(live)) {
            window.plugins.toast.showShortCenter('Already downloading: ' + live.title);
        }
        else {
            addQueueDownload(live);
            $scope.isDownloading = true;
            $scope.musicPath = service.musicPath;
            service.n_download = service.n_download + 1;
            $rootScope.$broadcast('refresh: download_changed');
            window.plugins.toast.showShortCenter('Your download is starting...');
    
            var downloadUrl = encodeURI(cordova.file.dataDirectory + 'MUSIC/' + live.url);
            var hostUrl = encodeURI($scope.musicPath + "/" + live.album + "/" + live.url);
    
            var fileTransfer = new FileTransfer();
            fileTransfer.onprogress = function(progress) {
                service.progress = progress;
                $rootScope.$broadcast('refresh: onProgress');
            };
            fileTransfer.download(
                hostUrl,
                downloadUrl,
                function(entry) {
                    service.cloudAPI.liveMusicDownloadAdd( { music_id: live.id, title: live.title, uuid: device.uuid } );
                    service.n_download = service.n_download - 1;
                    $rootScope.$broadcast('refresh: download_changed');
                    $scope.isDownloading = (service.n_download === 0) ? false : true;
                    service.offline_musics = service.getLocalStorageItems('offline_musics');
                    if (service.offline_musics.length === 0) {
                        service.offline_musics = [];
                    }
                    entry.getMetadata( 
                        function (file) { 
                            var music = {
                                id          : live.id,
                                title       : live.title,
                                title_en    : live.title_en,
                                artist      : live.artist,
                                artist_en   : live.artist_en,
                                url         : live.url,
                                thumb       : live.thumb,
                                album       : live.album,
                                type        : live.type,
                                view        : live.view,
                                liked       : live.liked,
                                download    : live.download,
                                size        : file.size
                            };
                            service.offline_musics.splice(0, 0, music);
                            localStorageService.set('offline_musics', service.offline_musics);
                            if ($scope.choice === 'download') {
                                $scope.musics = service.offline_musics;
                                $scope.showNoItem = ($scope.musics.length === 0) ? true : false;
                            }
                            removeQueueDownload(live);
                            $rootScope.$broadcast('refresh: download_finished');
                            window.plugins.toast.showShortCenter('Download finished: ' + music.title);
                        }
                    );
                },
                function(error) {
                    service.n_download = service.n_download - 1;
                    $rootScope.$broadcast('refresh: download_changed');
                    $scope.isDownloading = (service.n_download === 0) ? false : true;
                    removeQueueDownload(live);
                    window.plugins.toast.showShortCenter('Download failed...');
                }
            );
        }
    };
    
    $scope.onDownloadMusicDelete = function( item, itemIndex ) {
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
        if ($scope.choice === 'download_storage') {
            $scope.usedStorage = $scope.usedStorage - $scope.musics[itemIndex].size;
        }
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
    };
    
    $scope.onDownloadMusicDeleteAll = function() {
        $scope.musics = '';
        $scope.usedStorage = 0;
        $scope.showNoItem = true;
        $scope.$apply();
        localStorageService.set('offline_musics', $scope.musics);
        
        service.deleted_music = 'all';
        $rootScope.$broadcast('event: onOfflinePlaylistMusicDelete');
        
        window.resolveLocalFileSystemURL(cordova.file.dataDirectory, 
            function (fileSystem) {
                fileSystem.getDirectory('MUSIC', {create: false}, 
                    function (dirEntry) {
                        dirEntry.removeRecursively(
                            function () {
                                window.plugins.toast.showShortCenter('Deleted all songs.');
                            }, 
                            function (error) {}
                        );
                    }, 
                    function (error) {}
                );
            }, 
            function (error) {} 
        );
    };
    
    $scope.$on('event: onDownloadMusicAdd', function() {
        $scope.onDownloadMusicAdd(service.downloadedMusic);
    });

    $scope.$on('event: onDownloadMusicDelete', function() {
        $scope.onDownloadMusicDelete(service.downloadedMusic, service.downloadedMusicIndex);
    });

    $scope.$on('event: onDownloadMusicDeleteAll', function() {
        $scope.onDownloadMusicDeleteAll();
    });

    $scope.onOfflineMusicClick = function() {
        $scope.musics = service.getLocalStorageItems('offline_musics');
        $scope.showNoItem = ($scope.musics.length === 0) ? true : false;
    };

    $scope.$on('refresh: loadDownload', function() {
        $scope.grid         = 'hide';
        $scope.choice       = 'download';
        $scope.pageTitle    = 'បានទាញយក';
        $scope.limitToMusic = 60;
        
        $scope.isLoading = false;
        $scope.musics = service.getLocalStorageItems('offline_musics');
        $scope.showNoItem = ($scope.musics.length === 0) ? true : false;
        $scope.isOnline = (navigator.connection.type === Connection.NONE) ? false : true;
        
        service.offline_playlists = service.getLocalStorageItems('offline_playlists');
    });
    
    $scope.onTrashClick = function() {
        if ($scope.musics.length === 0) {
            window.plugins.toast.showShortCenter('No downloaded song to delete.');
            return;
        }
        var callback = function(index) {
            if (index == 1) {
                $rootScope.$broadcast('event: onDownloadMusicDeleteAll');
            }
        };
        var options = {
            'androidTheme' : window.plugins.actionsheet.ANDROID_THEMES.THEME_HOLO_LIGHT,
            'addDestructiveButtonWithLabel' : 'Delete All from My Device',
            'androidEnableCancelButton' : true,
            'addCancelButtonWithLabel': 'Cancel',
            'position': [20, 40]
        };
        window.plugins.actionsheet.show(options, callback);
    };
    
    $scope.onTrashSelect = function(item, itemIndex) {
        var callback = function(index) {
            if (index == 1) {
                service.downloadedMusic = item;
                service.downloadedMusicIndex = itemIndex;
                $rootScope.$broadcast('event: onDownloadMusicDelete');
            }
        };
        var options = {
            'title' : item.title,
            'addDestructiveButtonWithLabel' : 'Delete from My Device',
            'androidEnableCancelButton' : true,
            'addCancelButtonWithLabel': 'Cancel',
            'position': [20, 40]
        };
        if (ons.platform.isAndroid()) {
            options = {
                'androidTheme' : window.plugins.actionsheet.ANDROID_THEMES.THEME_HOLO_LIGHT,
                'addDestructiveButtonWithLabel' : 'Delete from My Device',
                'androidEnableCancelButton' : true,
                'addCancelButtonWithLabel': 'Cancel',
                'position': [20, 40]
            };
        }
        window.plugins.actionsheet.show(options, callback);
    };

}]);



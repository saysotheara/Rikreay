// This is a JavaScript file

app.controller('Controller', ['$rootScope', '$scope', 'service', '$http', 'localStorageService', function($rootScope, $scope, service, $http, localStorageService) {

    $scope.version = service.version;
    $scope.platform = service.platform;
    
    $scope.mvPath    = service.mvPath;
    $scope.viewPath  = service.viewPath;
    $scope.thumbPath = service.thumbPath;
    $scope.seriePath = service.seriePath;
    $scope.musicPath = service.musicPath;
    $scope.artistPath = service.artistPath;
    $scope.sponsorPath = service.sponsorPath;
    $scope.newsPath = service.newsPath;
    $scope.messageNoMusic = service.messageNoMusic;
    
    if (service.showTV !== undefined) {
        $scope.showTV = service.showTV;
    }
    if (service.getLocalStorageItems('showTV') === 'true') {
        $scope.showTV = true;
    }
    
    $scope.musicOptions = [
        {icon: 'history', desc: 'បានស្ដាប់'},
        {icon: 'trophy', desc: 'និយមស្ដាប់'},
        {icon: 'search', desc: 'ស្វែងរក'},
        {icon: 'cloud-download', desc: 'ទាញយក'}
    ];

    $scope.onHistoryClick = function() {
        $scope.app.slidingMenu.toggleMenu();
        $rootScope.$broadcast('refresh: loadHistory');
    };

    $scope.onSearchClick = function() {
        $scope.app.slidingMenu.toggleMenu();
        $rootScope.$broadcast('refresh: loadSearch');
    };

    $scope.onOptionSelect = function(item, index) {
        switch(index) {
            case 0:
                $scope.onHistoryClick();
                break;
            case 1:
                $scope.app.slidingMenu.toggleMenu();
                $rootScope.$broadcast('refresh: loadChart');
                break;
            case 2:
                $scope.onSearchClick();
                break;
            case 3:
                if ($scope.showTV) {
                    $scope.app.slidingMenu.toggleMenu();
                    $rootScope.$broadcast('refresh: loadDownload');
                }
                else {
                    $scope.app.slidingMenu.toggleMenu();
                    $rootScope.$broadcast('refresh: loadMusic');
                }
                break;
            default:
        }
    };

    $scope.$on('refresh: showPlayer', function(){
        $scope.showPlayer = service.showPlayer;
    });

    $scope.onPlaylistClick  = function() {
        $scope.app.slidingMenu.toggleMenu();
        $rootScope.$broadcast('refresh: loadPlaylist');
    };

    $scope.onProfileClick  = function() {
        if (navigator.connection.type === Connection.NONE) {
            window.plugins.toast.showShortCenter(service.messageNoInternet);
            return;
        }
        if ($scope.showTV) {
            $scope.app.slidingMenu.toggleMenu();
            $rootScope.$broadcast('refresh: loadProfile');
        }
        else {
            $scope.app.slidingMenu.toggleMenu();
            $rootScope.$broadcast('refresh: loadArtist');
        }
    };

    $scope.onRefreshClick  = function() {
        ons.ready(function() {
            if (ons.platform.isIOS()) {
                navigator.splashscreen.hide();
            }
            if (navigator.connection.type === Connection.NONE) {
                window.plugins.toast.showShortCenter(service.messageNoInternet);
                return;
            }
        });

        if (service.page === 'setting') {
            $rootScope.$broadcast('refresh: feature_artists');
            $rootScope.$broadcast('refresh: new_albums');
            $rootScope.$broadcast('refresh: mvs');
            service.musics_favorite = '';
            service.musics_for_you = '';
            service.musics_feature = '';
            service.musics_top = '';
            service.musics_new = '';
            service.productions = '';
            service.musics_newMV = '';
            service.musics_topMV = '';
            service.musics_recentMV = '';
            service.sponsors = '';
            service.artists = '';
            service.news = '';
        }

        if (!service.productions) {
            service.cloudAPI.liveProductionList()
                .success( function(result) {
                    service.productions = result;
                }
            );
        }
        
        service.showSpinner();
        service.cloudAPI.liveList( { version : $scope.version, platform : $scope.platform } )
            .success( function(result) {
                $scope.liveItems = result;
                service.liveItems = result;
                $scope.showTV = false;
                service.showTV = false;
                if (service.getLocalStorageItems('showTV') === 'true') {
                    $scope.showTV = true;
                    service.showTV = true;
                }
                for( i=0; i<=$scope.liveItems.length-1; i++) {
                    if ($scope.liveItems[i].type === 'tv') {
                        $scope.showTV = true;
                        service.showTV = true;
                        localStorageService.set('showTV', 'true');
                        $rootScope.$broadcast('refresh: showTV');
                        break;
                    }
                }
            })
            .finally(function() {
                service.hideSpinner();
                $rootScope.$broadcast('ACTION_REFRESH_DONE');
            }
        );
        ons.ready(function() {
            if (navigator.connection.type === Connection.NONE) {
                service.hideSpinner();
            }
        });

        if (!service.device) {
            ons.ready(function() {
                var userDevice = {
                    model    : device.model, 
                    platform : device.platform, 
                    uuid     : device.uuid, 
                    version  : device.version
                };
                service.uuid = device.uuid;
                service.device = userDevice;
                service.cloudAPI.liveDeviceAdd( userDevice );
                
                // setTimeout( function() {
                //     window.resolveLocalFileSystemURL(cordova.file.dataDirectory + 'MUSIC/', 
                //         function (fileSystem) {
                //             var musics = localStorageService.get('offline_musics');
                //             if (musics[ musics.length-1 ].size === undefined || musics[ musics.length-1 ].size === 0) {
                //                 var fileSize = [];
                //                 for( i=0; i<=musics.length-1; i++) {
                //                     var music = musics[i];
                //                     fileSystem.getFile(music.url, {create: false}, 
                //                         function (fileEntry) {
                //                             fileEntry.getMetadata(
                //                                 function (file) {
                //                                     fileSize.push(file.size);
                //                                 }
                //                             );
                //                         }
                //                     );
                //                 }
                //                 setTimeout(function(){
                //                     for( i=0; i<=musics.length-1; i++) {
                //                         musics[i].size = fileSize[i];
                //                     }
                //                     localStorageService.set('offline_musics', musics);
                //                 }, 100);
                //             }
                //         }
                //     );
                // }, 1000);
            });
        }
    };
    
    $scope.$on('ACTION_REFRESH_CONTENT', function(){
        $scope.onRefreshClick();
    });
    
    $scope.shuffleArray = function(array) {
        var m = array.length, t, i;
        while (m) {
            i = Math.floor(Math.random() * m--);
            t = array[m];
            array[m] = array[i];
            array[i] = t;
        }
        return array;
    };

    $scope.$on('refresh: mvs', function(){
        service.cloudAPI.liveMVList()
            .success( function(result) {
                $scope.mvs = result;
                service.mvs = result;
            }
        );
    });

    $scope.$on('refresh: new_albums', function() {
        $scope.new_albums = [];
        $scope.cover_albums = [];
        $scope.feature_albums = [];
        service.cloudAPI.liveAlbumList( { filter : "all"} )
            .success( function(result){
                for( i=0; i<=result.length-1; i++) {
                    if (result[i].other && result[i].other.indexOf('cover') > -1) {
                        $scope.cover_albums.push(result[i]);
                    }
                    if (result[i].other && result[i].other.indexOf('release') > -1) {
                        $scope.new_albums.push(result[i]);
                    }
                    if (result[i].other && result[i].other.indexOf('feature') > -1) {
                        $scope.feature_albums.push(result[i]);
                    }
                }
                service.albums = result;
                service.new_albums = $scope.new_albums;
                service.cover_albums = $scope.cover_albums;
                $scope.feature_albums = $scope.shuffleArray($scope.feature_albums);
                service.feature_albums = $scope.feature_albums;
            }
        );
    });

    $scope.$on('refresh: feature_artists', function() {
        service.cloudAPI.liveArtistList( { filter : "feature" } )
            .success( function(result){
                result = $scope.shuffleArray(result);
                var item = '';
                for(i=0; i<result.length; i++) {
                    if (result[i].name_en === 'Sinn Sisamouth') {
                        item = result[i];
                        result.splice(i, 1);
                        break;
                    }
                }
                result.splice(0, 0, item);
                $scope.feature_artists = result;
                service.feature_artists = result;
            }
        );
    });

    $scope.$on('event: onNetworkStatusChange', function(){
        $scope.isOnline = service.isOnline;
    });

    /*
    Music Player
    */
    function nowPlayingMusic() {
        $scope.musicNow = service.playedMusic;
        service.shouldReload_history = true;
        if (navigator.connection.type !== Connection.NONE) {
            service.cloudAPI.liveMusicViewAdd( { id: service.playedMusic.id, uuid: device.uuid, title: service.playedMusic.title } );
        }
        else {
            var offline_history = service.getLocalStorageItems('offline_history');
            if (offline_history.length === 0) {
                offline_history = [];
            }
            var music = {
                id          : service.playedMusic.id,
                title       : service.playedMusic.title,
                title_en    : service.playedMusic.title_en,
                artist      : service.playedMusic.artist,
                artist_en   : service.playedMusic.artist_en,
                url         : service.playedMusic.url,
                thumb       : service.playedMusic.thumb,
                album       : service.playedMusic.album,
                type        : service.playedMusic.type,
                view        : service.playedMusic.view,
                liked       : service.playedMusic.liked,
                download    : service.playedMusic.download,
                size        : service.playedMusic.size,
                uuid        : device.uuid,
                offline     : 'true'
            };
            offline_history.push(music);
            service.playedMusic_offline = music;
            localStorageService.set('offline_history', offline_history);
        }
    }

    $scope.musicNow = (service.playedMusic) ? service.playedMusic : '';
    $scope.$on('refresh: nowPlaying', function(){
        if (service.mediaPlayer) {
            $scope.player = service.mediaPlayer;
        }
        nowPlayingMusic();
    });
    $scope.$on('refresh: nextPlaying', function(){
        nowPlayingMusic();
        $rootScope.$broadcast('refresh: offline_history');
    });
        
    $scope.formatTime = function (value) {
        value = (value == undefined) ? 0 : value;
        var sec_num = parseInt(value, 10);
        var hours   = Math.floor(sec_num / 3600);
        var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
        var seconds = sec_num - (hours * 3600) - (minutes * 60);
    
        if (hours   < 10) {hours   = "0"+hours;}
        if (minutes < 10) {minutes = "0"+minutes;}
        if (seconds < 10) {seconds = "0"+seconds;}
        var time    = minutes + ':' + seconds;
        return time;
    };
    
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
    
    // Music
    $scope.isDownloading = (service.n_download === 0) ? false : true;
    $scope.$on('refresh: download_changed', function(){
        $scope.isDownloading = (service.n_download === 0) ? false : true;
        if (!$scope.app.slidingMenu.isMenuOpened()) {
            $scope.$apply();
        }
    });
    
    $scope.onMusicSelect = function(item, itemIndex) {
        var playlist = [];
        var items = $scope.musics;
        if ($scope.choice===1) {
            items = $scope.musics_top;
        }
        if ($scope.choice===2) {
            items = $scope.musics_feature;
        }
        if ($scope.choice===3) {
            items = $scope.musics_new;
        }
        if ($scope.choice==='for_you') {
            items = $scope.musics_for_you;
        }
        for( i=0; i<=items.length-1; i++) {
            items[i].src = encodeURI($scope.musicPath + "/" + items[i].album + "/" + items[i].url);
            if (items[i].offline) {
                items[i].src = encodeURI(cordova.file.dataDirectory + 'MUSIC/' + items[i].url);
            }
            playlist.push( items[i] );
        }
        if (items[itemIndex].src.indexOf('superean.com') > -1 && navigator.connection.type === Connection.NONE) {
            window.plugins.toast.showShortCenter(service.messageNoInternet);
            return;
        }
        if (!service.showPlayer) {
            service.play_exception = true;
        }
        service.track = itemIndex;
        service.music_playlists = playlist;
        service.playedMusic = items[service.track];
        $rootScope.$broadcast('refresh: showPlayer');
        $rootScope.$broadcast('refresh: reloadPlaylist');
        $rootScope.$broadcast('refresh: musicSelected');
        setTimeout( function() {
            $scope.onPlaylistClick();
            $scope.$apply();
        }, 300);
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
                    item.src = ($scope.choice==='download') ? encodeURI(cordova.file.dataDirectory + 'MUSIC/' + item.url) : encodeURI($scope.musicPath + "/" + item.album + "/" + item.url),
                    playlist.push( item );
                    service.music_playlists = playlist;
                    $rootScope.$broadcast('refresh: reloadPlaylist');
                    window.plugins.toast.showShortCenter('Added to Music Player...');
                }
                else {
                    // play music
                    service.play_exception = true;
                    $scope.onMusicSelect(item, itemIndex);
                }
            }
            // Add to My Music
            else if (index == 2) {
                service.saved_music = item;
                $rootScope.$broadcast('event: onMyMusicAdd');
            }
            // Add to My Playlist
            else if (index == 3) {
                if (buttonPlaylist === 'Add to My Playlist..') {
                    service.selected_music = item;
                    $rootScope.$broadcast('event: onPlaylistMusicAdd');
                }
                else {
                    service.selected_music = item;
                    service.selected_music_index = itemIndex;
                    $rootScope.$broadcast('event: onPlaylistMusicDelete');
                }
            }
            // Download this Music
            else if (index == 4 && service.showTV) {
                if (buttonDownload === 'Download this Music') {
                    service.downloadedMusic = item;
                    $rootScope.$broadcast('event: onDownloadMusicAdd');
                }
                else {
                    service.downloadedMusic = item;
                    service.downloadedMusicIndex = itemIndex;
                    $rootScope.$broadcast('event: onDownloadMusicDelete');
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
        var options = {
            'title' : item.title,
            'androidTheme': window.plugins.actionsheet.ANDROID_THEMES.THEME_HOLO_LIGHT,
            'buttonLabels': [buttonMusic, buttonFavorite, buttonPlaylist, buttonDownload],
            'androidEnableCancelButton' : true,
            'addCancelButtonWithLabel': 'Cancel',
            'position': [20, 40]
        };
        if (!service.showTV) {
            options = {
                'title' : item.title,
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
        if ($scope.musics.length > $scope.limitToNum) {
            $scope.limitToNum = $scope.limitToNum + 30;
        }
        else {
            window.plugins.toast.showShortCenter('No more music to load...');
        }
    };

    // Sponsor
    $scope.onSponsorSelect = function(item) {
        if (item.type === 'music') {
            item.album = item.name;
            service.selected_album = item;
            $scope.app.slidingMenu.toggleMenu();
            $rootScope.$broadcast('refresh: loadNewAlbum');
        }
        else if (item.type === 'mv') {
            item.album = item.name;
            service.selected_mv = item;
            $scope.app.slidingMenu.toggleMenu();
            $rootScope.$broadcast('refresh: loadMV');
        }
        else if (item.type === 'facebook') {
            appAvailability.check( 'com.facebook.katana', 
                function() {
                    window.open(item.url);
                },
                function() {
                    window.open(item.url, '_system');
                }
            );
        }
        else if (item.type === 'website') {
            window.open(item.url, '_system');
        }
        else {
            
        }
    };
    
}]);



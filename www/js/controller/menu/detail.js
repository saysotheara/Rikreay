// This is a JavaScript file

app.controller('DetailController', ['$rootScope','$scope', '$filter', 'service', '$controller', 'localStorageService', function($rootScope, $scope, $filter, service, $controller, localStorageService) {
    
    angular.extend(this, $controller('SNSController', {$scope: $scope}));
    
    $scope.$on('event: onNetworkStatusChange', function(){
        $scope.isOnline = service.isOnline;
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
    
    // My Profile
    function profileLoader() {
        $scope.back_button = 'Profile';
        $scope.detail       = 'profile';
        $scope.pageTitle    = service.selected_profile_item;
        $scope.collection   = service.selected_profile_item;
        $scope.limitToMusic = 60;
        $scope.showNoItem = false;
        $scope.isLoading = true;
        $scope.isOnline = true;
        $scope.musics = '';
    };
    if (service.detail === 'music_by_history') {
        profileLoader();
        $scope.choice = 'history';
        $scope.select = $scope.choice;
        if (navigator.connection.type === Connection.NONE) {
            $scope.choice = 'offline';
            $scope.select = 'offline_history';
            $scope.pageTitle  = 'Offline History';
            $scope.collection = $scope.pageTitle;
            $scope.isLoading = false;
            $scope.isOnline = false;
            $scope.musics = service.getLocalStorageItems('offline_history');
            if ($scope.musics.length > 0) {
                $scope.musics = $scope.musics.reverse();
            }
            $scope.showNoItem = ($scope.musics.length === 0) ? true : false;
            $scope.$apply();
        }
        else {
            service.cloudAPI.liveMusicHistoryList( { uuid : device.uuid } )
                .success( function(result) {
                    $scope.musics = result;
                })
                .finally( function() {
                    $scope.isLoading = false;
                    $scope.showNoItem = ($scope.musics.length === 0) ? true : false;
                }
            );
        }
    }
    if (service.detail === 'music_for_you') {
        profileLoader();
        $scope.choice = 'for_you';
        $scope.select = $scope.choice;
        if (service.musics_for_you) {
            $scope.musics = service.musics_for_you;
            $scope.isLoading = false;
            $scope.showNoItem = ($scope.musics.length === 0) ? true : false;
        }
        else {
            service.cloudAPI.liveMusicForYouList( { uuid : device.uuid } )
                .success( function(result) {
                    result = $scope.shuffleArray(result).splice(0, 50);
                    $scope.musics = result;
                    service.musics_for_you = result;
                })
                .finally( function() {
                    $scope.isLoading = false;
                    $scope.showNoItem = ($scope.musics.length === 0) ? true : false;
                }
            );
        }
    }
    if (service.detail === 'music_by_favorite') {
        profileLoader();
        $scope.choice = 'favorite';
        $scope.select = $scope.choice;
        if (!service.shouldReload_favorite && service.musics_favorite) {
            $scope.musics = service.musics_favorite;
            $scope.isLoading = false;
            $scope.showNoItem = ($scope.musics.length === 0) ? true : false;
        }
        else {
            service.cloudAPI.liveMusicSaveList( { uuid : device.uuid } )
                .success( function(result) {
                    $scope.musics = result;
                    service.musics_favorite = result;
                    service.shouldReload_favorite = false;
                })
                .finally( function() {
                    $scope.isLoading = false;
                    $scope.showNoItem = ($scope.musics.length === 0) ? true : false;
                }
            );
        }
    }
     
    $scope.$on('refresh: download_finished', function(){
        if ($scope.detail === 'download') {
            $scope.musics = service.getLocalStorageItems('offline_musics');
            $scope.showNoItem = ($scope.musics.length === 0) ? true : false;
        }
    });
     
    if (service.detail === 'music_by_download') {
        profileLoader();
        $scope.detail = 'download';
        $scope.choice = 'download';
        
        $scope.isLoading = false;
        $scope.musics = service.getLocalStorageItems('offline_musics');
        $scope.showNoItem = ($scope.musics.length === 0) ? true : false;
        $scope.isOnline = (navigator.connection.type === Connection.NONE) ? false : true;
    }    
    
    if (service.detail === 'music_by_download_storage') {    
        $scope.choice       = 'download_storage';
        $scope.detail       = 'download_storage';
        $scope.pageTitle    = 'Download Storage';
        $scope.limitToMusic = 60;

        $scope.musics = service.getLocalStorageItems('offline_musics');
        $scope.showNoItem = ($scope.musics.length === 0) ? true : false;
        $scope.isOnline = (navigator.connection.type === Connection.NONE) ? false : true;
        
        if ($scope.musics.length > 0) {
            $scope.usedStorage = 0;
            for( i=0; i<=$scope.musics.length-1; i++) {
                $scope.usedStorage = $scope.usedStorage + $scope.musics[i].size;
            }
        }
    }
            
    // Music by MV
    if (service.detail === 'music_by_mv') {
        $scope.back_button = 'Album';
        $scope.detail       = 'mv';
        $scope.pageTitle    = service.selected_mv.album;
        $scope.collection   = service.selected_mv.album;
        $scope.limitToMusic = 60;

        $scope.musics = '';
        $scope.showNoItem = false;
        $scope.isLoading = true;
        service.cloudAPI.liveMVDetailList( { album : service.selected_mv.album, uuid : device.uuid } )
            .success( function(result){
                $scope.musics = result;
            })
            .finally( function() {
                $scope.isLoading = false;
                $scope.showNoItem = ($scope.musics.length === 0) ? true : false;
            }
        );
    }

    // Music by Album
    if (service.detail === 'music_by_album') {
        $scope.back_button = 'Album';
        $scope.detail       = 'album';
        $scope.pageTitle    = service.selected_album.album;
        $scope.collection   = service.selected_album.album;

        $scope.musics = '';
        $scope.showNoItem = false;
        $scope.isLoading  = true;
        $scope.limitToMusic = 60;
        service.cloudAPI.liveMusicList( { album : service.selected_album.album } )
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

    // Music by Artist
    if (service.detail === 'music_by_artist') {
        $scope.back_button = 'Artist';
        $scope.detail       = 'artist';
        $scope.pageTitle    = service.selected_artist.name;
        $scope.collection   = service.selected_artist.name;

        $scope.musics = '';
        $scope.showNoItem = false;
        $scope.isLoading  = true;
        $scope.limitToMusic = 60;
        service.cloudAPI.liveArtistMusicList( { artist : service.selected_artist.name_en } )
            .success( function(result){
                $scope.musics = result;
                service.musics = result;
            })
            .finally( function() {
                $scope.isLoading = false;
                $scope.showNoItem = ($scope.musics.length === 0) ? true : false;
            }
        );
        $scope.isOnline = (navigator.connection.type === Connection.NONE) ? false : true;
    }
        
    $scope.onMusicSortBy = function(field) {
        $scope.field = field;
        $scope.subfield = 'title';
        $scope.reverse = false;
        $scope.limitToMusic = 60;
        if ($scope.field === 'liked' || $scope.field === 'view' || $scope.field === 'album') {
            $scope.reverse = true;
        }
        if ($scope.field === 'album') {
            $scope.musics = $filter('orderBy')($scope.musics, [$scope.field, $scope.subfield], $scope.reverse);
        }
        else {
            $scope.musics = $filter('orderBy')($scope.musics, $scope.field, $scope.reverse);
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

    // Radio Archive
    if (service.detail === 'radio_archive') {
        $scope.grid = 'show';
        $scope.detail = 'archive';
        $scope.isShowGrid = false;
        
        $scope.liveItems = [];
        $scope.pageTitle = 'ការផ្សាយប្រចាំថ្ងៃ';
        $scope.radioName = service.liveItem.name;
        
        var currentDate = new Date();
        
        for( i=1; i<=10; i++) {
            var url  = '';
            var date = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - i);
            if (service.liveItem.name.indexOf("RFI") > -1) {
                url  = service.liveItem.url + date.getFullYear() + ("0" + (date.getMonth() + 1)).slice(-2) + ("0" + date.getDate()).slice(-2) + '.mp3';
            }
            else if(service.liveItem.name.indexOf("RFA") > -1) {
                url  = service.liveItem.url + date.getFullYear() + '-' + ("0" + (date.getMonth() + 1)).slice(-2) + ("0" + date.getDate()).slice(-2) + '-2230.mp3';
            }
            else if(service.liveItem.name.indexOf("Post") > -1) {
                url  = service.liveItem.url + ("0" + date.getDate()).slice(-2) + '-' + ("0" + (date.getMonth() + 1)).slice(-2) + '-' + date.getFullYear() + '.mp3';
            }
            else if(service.liveItem.name.indexOf("VOA") > -1) {
                url  = service.liveItem.url + date.getFullYear() + '/' + ("0" + (date.getMonth() + 1)).slice(-2) + '/' + ("0" + date.getDate()).slice(-2) + '/' + date.getFullYear() + ("0" + (date.getMonth() + 1)).slice(-2) + ("0" + date.getDate()).slice(-2) + '-220000-VKH075-program.mp3';
            }
            else if(service.liveItem.name.indexOf("Australia") > -1) {
                url  = service.liveItem.url + date.getFullYear() + ("0" + (date.getMonth() + 1)).slice(-2) + ("0" + date.getDate()).slice(-2) + '.mp3';
            }
            else if(service.liveItem.name.indexOf("VOD") > -1) {
                url  = service.liveItem.url + ("0" + date.getFullYear()).slice(-2) + ("0" + (date.getMonth() + 1)).slice(-2) + ("0" + date.getDate()).slice(-2) + '-vod-thy-live-evening-news-' + date.getFullYear() + '-' + ("0" + (date.getMonth() + 1)).slice(-2) + '-' + ("0" + date.getDate()).slice(-2) + '.mp3';
            }
            else if(service.liveItem.name.indexOf("National") > -1) {
                url  = service.liveItem.url + date.getFullYear() + '/' + ("0" + (date.getMonth() + 1)).slice(-2) + '/' + ("0" + date.getDate()).slice(-2) + '-' + ("0" + (date.getMonth() + 1)).slice(-2) + '-' + date.getFullYear() + '%20PM.mp3';
            }
            else if(service.liveItem.name.indexOf("World") > -1) {
                url  = service.liveItem.url + ("0" + (date.getMonth() + 1)).slice(-2) + '-' + ("0" + date.getDate()).slice(-2) + '-' + ("0" + date.getFullYear()).slice(-2) + '_WKR_ALL_NEWS.mp3';
            }
            var liveItem = { 
                date    : date, 
                url     : url,
                id      : service.liveItem.id,
                name    : service.liveItem.name,
                thumb   : service.liveItem.thumb
            };
            $scope.liveItems.push( liveItem );
        }
    }    
    $scope.onRadioSelect = function(live) {
        $rootScope.$broadcast('refresh: stopPlayer');
        var audioUrl = live.url;
        var options = {
            bgColor: "#28292a",
            bgImage: $scope.viewPath + '/' + live.thumb,
            bgImageScale: "center",
            successCallback: function() {
            },
            errorCallback: function(errMsg) {
                window.plugins.toast.showShortCenter('Archive is not available. Please try again later.');
            }
        };
        window.plugins.streamingMedia.playAudio(audioUrl, options);
        service.cloudAPI.liveViewAdd( { id: live.id, uuid: device.uuid } );
    };
    
    // Music Connect via Facebook
    if (service.detail === 'connect') {
        $scope.back_button  = 'Profile';
        $scope.detail       = 'connect';
        $scope.pageTitle    = 'Activity & Connect';
        
        $scope.isLoading = true;
        service.cloudAPI.liveMusicConnectList()
            .success( function(result){
                $scope.musics = result;
            })
            .finally( function() {
                $scope.isLoading = false;
                $scope.showNoItem = ($scope.musics.length === 0) ? true : false;
            }
        );        
    }
    
    angular.extend(this, $controller('DownloadController', {$scope: $scope}));
    angular.extend(this, $controller('MenuMusicController', {$scope: $scope}));

}]);


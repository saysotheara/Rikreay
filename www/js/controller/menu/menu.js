// This is a JavaScript file

app.controller('MenuController', ['$rootScope','$scope', '$location', 'service', '$controller', 'localStorageService', function($rootScope, $scope, $location, service, $controller, localStorageService) {

    angular.extend(this, $controller('SNSController', {$scope: $scope}));

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
    
    $scope.formatTime = function (value) {
        value = (value == undefined) ? 0 : value;
        var sec_num = parseInt(value, 10);
        var hours   = Math.floor(sec_num / 3600);
        var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
        var seconds = sec_num - (hours * 3600) - (minutes * 60);
    
        if (hours   < 10) {hours   = "0"+hours;}
        if (minutes < 10) {minutes = "0"+minutes;}
        if (seconds < 10) {seconds = "0"+seconds;}
        var time    = minutes+':'+seconds;
        return time;
    };

    $scope.onListClick  = function() {
        $scope.isShowGrid = false;
    };
    $scope.onGridClick  = function() {
        $scope.isShowGrid = true;
    };

    $scope.$on('event: onNetworkStatusChange', function(){
        $scope.isOnline = service.isOnline;
    });

    /*
        Live - Radio, TV
    */
    angular.extend(this, $controller('LiveController', {$scope: $scope}));

    /*
        Music Top & New - Promotion
    */
    angular.extend(this, $controller('PromoteController', {$scope: $scope}));
    
    /*
        Music Chart
    */
    angular.extend(this, $controller('ChartController', {$scope: $scope}));
    
    /*
        Music Download
    */
    angular.extend(this, $controller('DownloadController', {$scope: $scope}));
    
    /*
        Music My Playlist
    */
    angular.extend(this, $controller('MyPlaylistController', {$scope: $scope}));
    
    /*
        Music History
    */
    angular.extend(this, $controller('HistoryController', {$scope: $scope}));    
    
    /*
        Music Ablum & Artist
    */
    angular.extend(this, $controller('ArtistController', {$scope: $scope}));

    /*
        Music Video
    */
    angular.extend(this, $controller('MVController', {$scope: $scope}));

    /*
        Search
    */
    angular.extend(this, $controller('SearchController', {$scope: $scope}));

    /*
        My Profile
    */
    angular.extend(this, $controller('ProfileController', {$scope: $scope}));

    /*
        Common Functionalities
    */
    angular.extend(this, $controller('MenuMusicController', {$scope: $scope}));

}]);

app.controller('MoreController', ['$rootScope','$scope', 'service', 'localStorageService', function($rootScope, $scope, service, localStorageService) {

    $scope.productions = service.productions;
    $scope.productionPath = service.productionPath;

    $scope.onAlbumFilterClick = function(album) {
        service.filterAlbum = album;
        $rootScope.$broadcast('refresh: filterAlbum');
        $scope.popover = service.getPopover();
        $scope.popover.hide();
    };
    
}]);


// This is a JavaScript file

app.controller('SearchController', ['$rootScope', '$scope', '$filter', 'service', 'localStorageService', function($rootScope, $scope, $filter, service, localStorageService) {

    $scope.$on('refresh: loadSearch', function() {
        $scope.grid         = 'hide';
        $scope.choice       = 'search';
        $scope.pageTitle    = 'ស្វែងរកបទចំរៀង';
        $scope.musics       = '';
        service.musics      = '';
        $scope.searchText   = '';
        $scope.showNoItem   = false;
        $scope.limitToMusic = 50;
    });

    $scope.onSearchOptionClick = function() {
        $scope.musics       = '';
        $scope.searchText   = '';
        $scope.limitToMusic = 50;
        $scope.showNoItem   = false;
    };
    
    function doSearch(searchText) {
        $scope.isLoading = true;
        $scope.showNoItem = true;
        service.cloudAPI.liveSearch( { searchBy: 'music', searchText: searchText } )
            .success( function(result) {
                $scope.musics = result;
                service.musics = result;
            })
            .finally(function() {
                $scope.isLoading = false;
                $scope.showNoItem = ($scope.musics.length === 0) ? true : false;
            }
        );
    }

    $scope.$watch('searchText', function (value) {
        if (value && value.indexOf('@') > -1) {
            doSearch(value);
            return;
        }

        if (value && value.length > 1) {
            if (value.length == 3) {
                doSearch(value);
            }
            else {
                $scope.musics = $filter('filter')( service.musics, {'title': value} );
                $scope.showNoItem = ($scope.musics && $scope.musics.length === 0) ? true : false;
            }
        }
    });
    
    $scope.onStartSearchClick = function() {
        if ($scope.searchText.length > 3) {
            doSearch($scope.searchText);
        }
        else {
            window.plugins.toast.showShortCenter('Search query is too short.');
        }
        // close keyboard
        // cordova.plugins.Keyboard.close();
    };
    
    $scope.onSearchPlayClick = function() {
        $scope.onMusicPlay();
    };

    $scope.onQuickSearchClick = function() {
        $scope.searchQuery = '';
        $scope.showSearch = !$scope.showSearch;
    };

}]);


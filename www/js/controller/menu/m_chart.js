// This is a JavaScript file

app.controller('ChartController', ['$rootScope', '$scope', 'service', 'localStorageService', function($rootScope, $scope, service, localStorageService) {

    $scope.loadMusicChart = function(option) {
        $scope.musics = '';
        $scope.isLoading  = true;
        $scope.showNoItem = false;
        service.cloudAPI.liveMusicChartList( { filter : option } )
            .success( function(result) {
                $scope.musics = result;
                service.musics = result;
            })
            .finally( function() {
                $scope.isLoading = false;
                $scope.showNoItem = ($scope.musics.length === 0) ? true : false;
            }
        );
    }
    
    $scope.onChartClick = function(option) {
        $scope.select = option;
        $scope.searchText = '';
        $scope.showSearch = false;
        $scope.loadMusicChart(option);
    };
    
    $scope.$on('refresh: loadChart', function() {
        $scope.grid         = 'hide';
        $scope.choice       = 'chart';
        $scope.select       = 'day';
        $scope.pageTitle    = '';
        $scope.limitToMusic = 60;
        $scope.showNoItem   = false;
        $scope.loadMusicChart($scope.select);
    });

}]);



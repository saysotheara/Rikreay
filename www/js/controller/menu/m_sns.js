// This is a JavaScript file

app.controller('SNSController', ['$rootScope', '$scope', 'service', 'localStorageService', function($rootScope, $scope, service, localStorageService) {

    var schemeFacebook  = '';
    var schemeTwitter   = '';
    if (ons.platform.isIOS()) {
        $scope.store    = "App Store";
        schemeTwitter   = 'twitter://';
        schemeFacebook  = 'fb://';
    }
    else if (ons.platform.isAndroid()) {
        $scope.store    = "Google Play Store";
        schemeTwitter   = 'com.twitter.android';
        schemeFacebook  = 'com.facebook.katana';
    }
    else {
        $scope.store = "Not available!";
    }
    
    if (service.about) {
        $scope.about = service.about;
    }
    else {
        service.cloudAPI.aboutList()
            .success( function(result, status){
                $scope.about = result[1];
                service.about = result[1];
            }
        );
    }
    
    $scope.onRateClick = function() {
        var reviewUrl;
        if (ons.platform.isIOS()) {
            reviewUrl = $scope.about.url_ios;
        }
        else if (ons.platform.isAndroid()) {
            reviewUrl = $scope.about.url_android;
        }
        else {
            reviewUrl = '';
        }
        window.open(reviewUrl, '_system');
    };
    
    $scope.onLikeClick = function() {
        window.open($scope.about.facebook, '_blank');
    };
    
    $scope.onFacebookClick = function() {
        appAvailability.check(
            schemeFacebook, 
            function() {  // Success callback
                window.open('fb://profile/384416715092514', '_system', 'location=yes');
            },
            function() {  // Error callback
                window.open($scope.about.facebook, '_blank');
            }
        );
    };
    
    $scope.onTwitterClick = function() {
        appAvailability.check(
            schemeTwitter, 
            function() {  // Success callback
                window.open('twitter://user?screen_name=OnlineSuperean', '_system', 'location=yes');
            },
            function() {  // Error callback
                window.open($scope.about.twitter, '_blank');
            }
        );
    };
    
    $scope.onAppleClick = function() {
        window.open($scope.about.url_ios, '_system');
    };

    $scope.onGoogleClick = function() {
        if (ons.platform.isAndroid()) {
            $scope.onRateClick();
        }
        else {
            window.open('https://play.google.com/store/apps/details?id=com.rabbee.me', '_system');
        }
    };
    
}]);


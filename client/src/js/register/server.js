'use strict';

app.controller('RegisterServerCtrl', function ($scope, $window, $location, $state, $rcConstants) {
    $scope.showError = false;
    $scope.showInfo = false;
    $scope.errorText = "";
    $scope.showConnectionError = false;
    $scope.showRegisterServerError = false;
    $scope.showPending = false;
    $scope.readOnly = false;

    var host = $location.host();
    if (host.indexOf("localhost") >= 0) {
        //debug values - for developer
        $scope.server = "127.0.0.1:1338";
        $scope.serverPattern = ".+"
    } else {
        //user
        $scope.server = "ravencrypt.net";
        $scope.serverPattern = $rcConstants.SERVER_PATTERN;
    }

    $scope.checkAvailable = function(){

        $scope.showConnectionError = false;
        $scope.showError = false;
        $scope.showInfoAvailable = false;

        var rxSV = new RegExp($scope.serverPattern);
        if(!rxSV.test($scope.server)){
            $scope.showError = true;
            $scope.errorText = "INCORRECT_SERVER_FORMAT";
        }

        $scope.showPending = true;

        var requestUrl = "https://" + $scope.server + "/";

        $.ajax({
            type: 'GET',
            url: requestUrl,
            success: function (data) {
                $scope.showPending = false;

                $state.transitionTo("register.name", {
                    server: $scope.server
                });
            },
            error: function(jqXHR){
                $scope.showPending = false;

                switch(jqXHR.status){
                    case 400:
                        // Something went wrong
                        $scope.showError = true;
                        $scope.errorText = jqXHR.responseJSON;
                        break;
                    case 500:
                        // Server side error
                        $scope.showConnectionError = true;
                        $scope.UserExistsError = 'SERVER_ERROR';
                        break;
                    case 503:
                        // Server overload - try again
                        $scope.showConnectionError = true;
                        $scope.UserExistsError = 'SERVER_OVERLOAD';
                        break;
                    default:
                        //everything else
                        $scope.showConnectionError = true;
                        $scope.UserExistsError = 'SERVER_UNABLE_TO_GET_DATA';
                }
                $scope.$apply();
            }
        });
    }
});

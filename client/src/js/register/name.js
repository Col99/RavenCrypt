'use strict';

app.controller('RegisterNameCtrl', function ($scope, $window, $location, $state, $rcConstants, $stateParams) {
    $scope.server = $stateParams.server;

    $scope.showError = false;
    $scope.showInfo = false;
    $scope.errorText = "";
    $scope.showConnectionError = false;
    $scope.showRegisterServerError = false;
    $scope.UserExistsError = "";
    $scope.showPending = false;
    $scope.readOnly = false;

    $scope.userNamePattern = $rcConstants.USER_NAME_PATTERN;

    var host = $location.host();
    if (host.indexOf("localhost") >= 0) {
        //debug values - for developer
        $scope.userName = "test" + Math.floor(Math.random() * 10000);
    } else {
        //user
        $scope.userName = "";
    }

    $scope.checkAvailable = function(){

        $scope.showConnectionError = false;
        $scope.showError = false;
        $scope.showInfoAvailable = false;

        var rxUN = new RegExp($scope.userNamePattern);
        if(!rxUN.test($scope.userName)){
            $scope.showError = true;
            $scope.errorText = "INCORRECT_USER_NAME_FORMAT";
            return;
        }

        $scope.showPending = true;

        var requestUrl = "https://" + $scope.server + "/exists/";
        var requestData = {
            name: $scope.userName.toLocaleLowerCase()
        };

        $.ajax({
            type: 'POST',
            url: requestUrl,
            data: JSON.stringify(requestData),
            success: function (data) {
                $scope.showPending = false;

                //data == 1; name is fully registered.
                //data == 2; name is in the process of registering

                if(data != "0"){
                    $scope.readOnly = true;
                    $scope.showError = true;
                    $scope.errorText = "USER_EXISTS_ON_SERVER";
                } else {
                    $scope.showInfoAvailable = true;
                    $scope.userID = $scope.userName + "@" + $scope.server
                }
                $scope.$apply();
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

    $scope.importKey = function () {
        $state.transitionTo("register.importKey", {
            server: $scope.server,
            userName: $scope.userName
        });
    }

    $scope.createKey = function () {
        $state.transitionTo("register.createKey", {
            server: $scope.server,
            userName: $scope.userName
        });
    }
});

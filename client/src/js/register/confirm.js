'use strict';

app.controller('ConfirmCtrl', function ($scope, $window, $location, $state, $stateParams, $ydnDB) {
    $scope.userName = $stateParams.userName;
    $scope.server = $stateParams.server;
    $scope.userID = $scope.userName + "@@@" + $scope.server;
    $scope.keyHasPassword = $stateParams.keyHasPassword;
    $scope.confirmCode = "";
    $scope.privateKeyArmored = $.trim($stateParams.privateKeyArmored);
    $scope.publicKeyArmored = $.trim($stateParams.publicKeyArmored);

    $scope.showError = false;

    $scope.error = "";
    $scope.showError = false;

    try{
        var rcKeyPair = RavenCryptAsymmetricKeyPair.createNew({
            privateKeyArmored: $scope.privateKeyArmored,
            publicKeyArmored: $scope.publicKeyArmored
        });
        $scope.error = "NO_PGP_KEY";
        $scope.keyID = rcKeyPair.keyID;
    } catch (err) {
        $scope.showError = true;
    }

    $scope.Captcha = 'data:image/png;base64,' + $stateParams.confirmCodeImage;

    $scope.register = function () {
        var requestUrl = "https://" + $scope.server + "/register/confirm";


        if(isNaN($scope.Code)) {
            $scope.showError = false;
            $scope.error = "CODE_IS_NOT_A_NUMBER";
            return;
        }

        $scope.showError = false;
        $scope.showPending = true;

        var privateKey = rcKeyPair.privateKey;
        var signedCode = privateKey.sign($scope.Code);

        $.ajax({
            type: 'POST',
            url: requestUrl,
            data: JSON.stringify({
                user: $scope.userName,
                activationCode: signedCode
            }),
            success: function (data) {
                $scope.showPending = false;

                $ydnDB.put('account', {
                    user: $scope.userName,
                    server: $scope.server
                });
                $ydnDB.put('userKeyPair', {
                    user: $scope.userName,
                    server: $scope.server,
                    id: $scope.keyID,
                    privateKeyArmored: $scope.privateKeyArmored,
                    publicKeyArmored: $scope.publicKeyArmored
                });

                $state.transitionTo("login");
                $scope.$apply();
            },
            error: function(jqXHR){
                $scope.showPending = false;
                $scope.showError = true;
                switch(jqXHR.status){
                    case 500:
                        // Server side error
                        $scope.error = 'SERVER_ERROR';
                        break;
                    case 503:
                        // Server overload - try again
                        $scope.error = 'SERVER_OVERLOAD';
                        break;
                    case 400:
                        //something went wrong
                        $scope.error = jqXHR.responseText;
                        break;
                    default:
                        //everything else
                        $scope.error = 'SERVER_UNABLE_TO_GET_DATA';
                }
                $scope.$apply();
            }
        });
    }
});
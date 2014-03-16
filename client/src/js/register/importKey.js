'use strict';

app.controller('RegisterImportKeyCtrl', function ($scope, $window, $location, $state, $stateParams) {
    $scope.privateKeyArmored = "";
    $scope.publicKeyArmored = "";
    $scope.keyHasPassword = false;
    $scope.showError = false;

    $scope.finishRegister = function(){
        $scope.privateKeyArmored = $.trim($scope.privateKeyArmored);
        $scope.publicKeyArmored = $.trim($scope.publicKeyArmored);

        try{
            var rcKeyPair = RavenCryptAsymmetricKeyPair.createNew({
                privateKeyArmored: $scope.privateKeyArmored,
                publicKeyArmored: $scope.publicKeyArmored
            });
            $scope.keyID = rcKeyPair.keyID;
        } catch (err) {
            $scope.showError = true;
            return;
        }

        $state.transitionTo("register.signUp", {
            server: $stateParams.server,
            userName: $stateParams.userName,
            privateKeyArmored: $scope.privateKeyArmored,
            publicKeyArmored: $scope.publicKeyArmored,
            keyHasPassword: $scope.keyHasPassword
        })
    }
});


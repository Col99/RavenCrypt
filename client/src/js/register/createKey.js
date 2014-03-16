'use strict';

app.controller('RegisterCreateKeyCtrl', function ($scope, $window, $location, $state, $stateParams) {
    var interval = null;

    $scope.userName = $stateParams.userName;
    $scope.server = $stateParams.server;

    $scope.showCreateKey = true;
    $scope.showGenerateKey = false;

    $scope.algorithm = 1;
    $scope.keyLength = 2048;
    $scope.password = "";

    $scope.keyGenText = "";
    $scope.keyGenTime = -1;
    $scope.workerFinished = false;
    $scope.workerSuccessfull = false;
    $scope.workerError = "";
    $scope.keyHasPassword = false;

    $scope.genKey = function () {
        var keyLength = $scope.keyLength
        if (!isNumber(keyLength))
            alert("Key length must be a number!");
        if (keyLength < 2048)
            alert("Key length can't be less then 2048")
        if (keyLength > 4096)
            alert("Key length can't exceed 4096");
        else {
            if($scope.password)
                $scope.keyHasPassword = true;

            //first start our worker
            startWorker();

            //then update our interface
            $scope.showCreateKey = false;
            $scope.showGenerateKey = true;

            if (!checkProgress()) {
                interval = setInterval(function () {
                    checkProgress(true);
                }, 1000);
            }

        }
    }

    function isNumber(n) {
        return !isNaN(parseFloat(n)) && isFinite(n);
    }

    var startWorker = function () {
        $scope.workerFinished = false;


        var userIdForPublicKeyServer = $scope.userName + "@@@" + $scope.server;

        if($scope.password == "") {
            $scope.password = null;
        }

        openpgp.generateKeyPair($scope.algorithm, $scope.keyLength, userIdForPublicKeyServer,  $scope.password, callback);

        function callback(err, keyPair) {
            if(err) {
                $scope.workerFinished = true;
                console.log(JSON.stringify(err));
                $scope.workerError = "KEY_GEN_ERROR";

                $scope.$apply();
                return;
            }

            $scope.privateKeyArmored = keyPair['privateKeyArmored'];
            $scope.publicKeyArmored = keyPair['publicKeyArmored'];

            $scope.workerFinished = true;
            $scope.workerSuccessfull = true;

            $scope.$apply();
            return;
        }
    }

    var checkProgress = function (apply) {
        if ($scope.workerFinished) {
            clearInterval(interval);
            if ($scope.workerSuccessfull) {

                $state.transitionTo("register.signUp", {
                    server: $scope.server,
                    userName: $scope.userName,
                    privateKeyArmored: $scope.privateKeyArmored,
                    publicKeyArmored: $scope.publicKeyArmored,
                    keyHasPassword: $scope.keyHasPassword
                })
            } else {
                $scope.keyGenText = JSON.stringify($scope.workerError);
            }
        } else {
            $scope.keyGenTime += 1;
            $scope.keyGenText = "" + Array($scope.keyGenTime + 1).join("+");
        }

        if (apply)
            $scope.$apply();

        return false;
    }
});
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
        var keyGenWorker = new Worker("partials/register/worker.js");

        keyGenWorker.onmessage = function (oEvent) {
            var data = oEvent.data;

            $scope.privateKeyArmored = data.privateKeyArmored;
            $scope.publicKeyArmored = data.publicKeyArmored;

            $scope.workerFinished = true;
            $scope.workerSuccessfull = true;

        };
        keyGenWorker.onerror = function (error) {
            $scope.workerFinished = true;
            $scope.workerError = error;

        };

        var buf = new Uint32Array(1000);
        window.crypto.getRandomValues(buf);

        var msg = {
            algorithm: parseInt($scope.algorithm),
            keyLength: parseInt($scope.keyLength),
            userId: $scope.userName + "@" + $scope.server,
            randomByteBuffer: buf
        }
        var password = $scope.password;
        if (password)
            msg.password = password + "";

        keyGenWorker.postMessage(msg);
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
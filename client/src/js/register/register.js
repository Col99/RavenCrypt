app.controller('CredentialsCtrl', function ($scope, $window, $location, $state, $rcConstants) {
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
        $scope.server = "127.0.0.1:1338";
        $scope.userName = "test" + Math.floor(Math.random() * 10000);
        $scope.serverPattern = ".+"
    } else {
        //user
        $scope.server = "ravencrypt.net";
        $scope.userName = "";
        $scope.serverPattern = $rcConstants.SERVER_PATTERN;
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
        var rxSV = new RegExp($scope.serverPattern);
        if(!rxUN.test($scope.userName)){
            $scope.showError = true;
            $scope.errorText = "INCORRECT_SERVER_FORMAT";
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

app.controller('ImportKeyCtrl', function ($scope, $window, $location, $state, $stateParams) {
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

app.controller('CreateKeyCtrl', function ($scope, $window, $location, $state, $stateParams) {
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


app.controller('SignUpCtrl', function ($scope, $window, $location, $state, $stateParams, $indexedDB) {
    $scope.userName = $stateParams.userName;
    $scope.server = $stateParams.server;
    $scope.userID = $scope.userName + "@" + $scope.server;
    $scope.keyHasPassword = $stateParams.keyHasPassword;

    $scope.privateKeyArmored = $.trim($stateParams.privateKeyArmored);
    $scope.publicKeyArmored = $.trim($stateParams.publicKeyArmored);

    $scope.registerServerError = "";

    $scope.showNoPGPKeysError = false;

    try{
        var rcKeyPair = RavenCryptAsymmetricKeyPair.createNew({
            privateKeyArmored: $scope.privateKeyArmored,
            publicKeyArmored: $scope.publicKeyArmored
        });
        $scope.keyID = rcKeyPair.keyID;
    } catch (err) {
        $scope.showNoPGPKeysError = true;
    }

    $scope.register = function () {
        var requestUrl = "https://" + $scope.server + "/register";

        $scope.showPending = true;

        $.ajax({
            type: 'POST',
            url: requestUrl,
            dataType: "json",
            data: JSON.stringify({
                userName: $scope.userName,
                publicKey: $scope.publicKeyArmored,
                keyID: $scope.keyID
            }),
            success: function (data) {
                $scope.showPending = false;

                //TODO: add real account
                addTestAccount($indexedDB, $scope.userID, function(){
                    $state.transitionTo("login");
                    $scope.$apply();
                });
            },
            error: function(jqXHR){
                $scope.showPending = false;
                $scope.showRegisterServerError = true;
                switch(jqXHR.status){
                    case 500:
                        // Server side error
                        $scope.registerServerError = 'SERVER_ERROR';
                        break;
                    case 503:
                        // Server overload - try again
                        $scope.UserExistsError = 'SERVER_OVERLOAD';
                        break;
                    case 400:
                        //something went wrong, server answer is a json string, we should have a translation for this
                        $scope.UserExistsError = jqXHR.responseJSON;
                        break;
                    default:
                        //everything else
                        $scope.UserExistsError = 'SERVER_UNABLE_TO_GET_DATA';
                }
            }
        });
    }
});

function addTestAccount($indexedDB, userID, callback) {

    const ACCOUNTS_STORE = 'accounts';

    $indexedDB.getDB(function (db) {
        var tx = db.transaction(ACCOUNTS_STORE, "readwrite");
        var store = tx.objectStore(ACCOUNTS_STORE);

        var request = store.put({name: userID});

        request.onerror = function() {
            callback();
        };
        request.onsuccess = function() {
            callback();
        };
    });
}

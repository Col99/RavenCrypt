'use strict';

app.controller('RegisterSignUpCtrl', function ($scope, $window, $location, $state, $stateParams) {
    $scope.userName = $stateParams.userName;
    $scope.server = $stateParams.server;
    $scope.userID = $scope.userName + "@" + $scope.server;
    $scope.keyHasPassword = $stateParams.keyHasPassword;

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
        $scope.keyID = rcKeyPair.keyID;
    } catch (err) {
        $scope.showError = true;
    }

    $scope.register = function () {
        var requestUrl = "https://" + $scope.server + "/register";

        $scope.showError = false;
        $scope.showPending = true;

        $.ajax({
            type: 'POST',
            url: requestUrl,
            data: JSON.stringify({
                user: $scope.userName,
                publicKey: $scope.publicKeyArmored,
                keyID: $scope.keyID
            }),
            success: function (data) {
                $scope.showPending = false;

//                //TODO: add real account
//                addTestAccount($indexedDB, $scope.userID, function(){
//                    $state.transitionTo("login");
//                    $scope.$apply();
//                });
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
                        $scope.error = 'BAD_REQUEST';
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


function addTestAccount($database, userID, callback) {

//    const ACCOUNTS_STORE = 'accounts';
//
//    $indexedDB.getDB(function (db) {
//        var tx = db.transaction(ACCOUNTS_STORE, "readwrite");
//        var store = tx.objectStore(ACCOUNTS_STORE);
//
//        var request = store.put({name: userID});
//
//        request.onerror = function() {
//            callback();
//        };
//        request.onsuccess = function() {
//            callback();
//        };
//    });
}

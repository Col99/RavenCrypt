app.controller('LoginCtrl', function($scope, $window, $location, $state, $stateParams) {

    const ACCOUNT_STORE = 'accounts';

    $scope.accounts = [];

//    //test data
//    $scope.accounts.push({name:"first"});
//    $scope.accounts.push({name:"second"});

//    $indexedDB.getDB(function(db){
//        var tx = db.transaction(ACCOUNT_STORE, "readonly");
//        var store = tx.objectStore(ACCOUNT_STORE);
//
//        //get everything
//        var request = store.openCursor(IDBKeyRange.lowerBound(0));
//        request.onsuccess = function() {
//            var cursor = request.result;
//            if (cursor) {
//                // Called for each matching record.
//                $scope.accounts.push(cursor.value)
//                $scope.account = $scope.accounts[0];
//                cursor.continue();
//                $scope.$apply();
//            } else {
//                if($scope.accounts.length == 0) {
//                    $state.go("register.credentials");
//                }
//            }
//        }
//    });

    $scope.login = function() {
        //alert('TODO: Hi "' + $scope.account.name + '"');
        $state.go("main", {userID: $scope.account.name});
    }

    $scope.register = function() {
      $state.go("register.credentials");
    }
});

app.controller('MainCtrl', function($scope, $window, $location, $state, $stateParams, $rcConstants, $database) {

    $scope.account = null;

//    $indexedDB.getDB(function(db){
//        var tx = db.transaction($rcConstants.ACCOUNT_STORE, "readonly");
//        var store = tx.objectStore($rcConstants.ACCOUNT_STORE);
//
//        //get everything
//        var request = store.openCursor(IDBKeyRange.lowerBound(0));
//        request.onsuccess = function() {
//            var cursor = request.result;
//            if (cursor) {
//                // Called for each matching record.
//                $scope.account = cursor.value;
//                $scope.$apply();
//            } else {
//                $state.go("login");
//                $state.$apply();
//            }
//        }
//    });
});
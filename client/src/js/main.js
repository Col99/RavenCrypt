app.controller('MainCtrl', function($scope, $window, $location, $state, $stateParams, $rcConstants, $ydnDB) {
    $scope.account = null;

    alert("test");

    $ydnDB.values('account').done(function(records) {
        if(records.length > 0) {
            $scope.account = records;
            $scope.$apply();
        } else {
            $state.go("login");
            $state.$apply();
        }
    });
});
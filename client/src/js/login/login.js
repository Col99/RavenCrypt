app.controller('LoginCtrl', function($scope, $state, $stateParams, $ydnDB) {

    $scope.accounts = [];
    $scope.account = {};

    refresh(true);
    function refresh(apply){
        $scope.accounts = [];
        $scope.account = {};

        $ydnDB.values('account').done(function(records) {
            $scope.accounts = records;

            var l = records.length;
            for(var i=0;i<l;i++){
                records[i].id = records[i].user + "@@@" + records[i].server;
            }

            if(records.length > 0) {
                $scope.account = $scope.accounts[0];
                if(apply) {
                    $scope.$apply();
                }
            } else {
                $state.go("register.server");
            }
        });
    }

    $scope.login = function() {
        $state.go("main", {userID: $scope.account.id});
    };

    $scope.register = function() {
      $state.go("register.server");
    };

    $scope.deleteAcc = function() {
        var user = $scope.account.user;
        var server =$scope.account.server;

        $ydnDB
            .remove(
                'account',[user, server]
            )
            .done(function(count){
                if(count == 1) {
                    refresh(true);
                }
            });
    }
});

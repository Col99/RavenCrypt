app.controller('LoginCtrl', function($scope, $window, $location, $state, $stateParams, $ydnDB) {

    $scope.accounts = [];

//    //test data
//    $scope.accounts.push({name:"first"});
//    $scope.accounts.push({name:"second"});

    $ydnDB.values('account').done(function(records) {
        $scope.accounts = records;

        var l = records.length;
        for(var i=0;i<l;i++){

            records[i].id = records[i].user + "@@@" + records[i].server;

        }

        if(records.length > 0) {
            $scope.account = $scope.accounts[0];
            $scope.$apply();
        } else {
            $state.go("register.server");
        }
    });

    $scope.login = function() {
        //alert('TODO: Hi "' + $scope.account.name + '"');
        $state.go("main", {userID: $scope.account.name});
    }

    $scope.register = function() {
      $state.go("register.server");
    }
});

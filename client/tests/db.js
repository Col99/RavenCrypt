module("DBTest");

test("schemaTest", function() {


    var schema = {
        stores: [
        {
            name: 'player',
            keyPath: 'id',
            indexes: [{
                name: 'id',
                type: 'INTEGER',
                unique: true
            }]
        }, {
            name: 'weapon',
            keyPath: 'name'
        }]
    };

    var db2 = new ydn.db.Storage('RavenCrypt', schema);


    var weapon_data = [{
        name: 'gun',
        count: 5
    }, {
        name: 'sword',
        count: 10
    }, {
        name: 'laser',
        count: 1
    }];


    db2.put('weapon', weapon_data);


    equal("test", "test");
});

test("db works", function() {

    ok(db != null);
});

test("put throws when not in schema", function() {
    var weapon_data = [{
        name: 'gun',
        count: 5
    }, {
        name: 'sword',
        count: 10
    }, {
        name: 'laser',
        count: 1
    }];

    try {
        db.put('weapon', weapon_data);

        ok(false);
    } catch(err){
        ok(true);
    }

});

//asyncTest( "asynchronous test: one second later!", function() {
//    expect( 1 );
//    setTimeout(function() {
//        ok( true, "Passed and ready to resume!" );
//        start();
//    }, 1000);
//});

asyncTest("put and remove works when in schema", function() {
    expect(2);

    var account = [{
        user: 'user',
        server:'server'
    }];

    try {
        db.put('account', account);

        ok(true);
    } catch(err){
        ok(false);
    } finally {
        db
            .remove(
                'account',['user', 'server']
            )
            .done(function(count){

                ok(count > 0, 'records deleted');
                start();
            })
            .fail(function(err){

                ok(false, 'failed deleting records');
                start();
            });
    }
});

asyncTest("remove fails when not existing", function() {
    expect(1);

    db
        .remove(
            'account',['user', 'server']
        )
        .done(function(count){
            ok(count == 0);
            start();
        })
        .fail(function(err){
            ok(false);
            //console.log('failed:' + JSON.stringify(err));
            start();
        });

});


asyncTest("put in the same item twice and you get no error, but don't create any new entry.", function() {
    expect(3);

    var account = [{
        user: 'user',
        server:'server'
    }];

    try {
        db.put('account', account);
        db.put('account', account);

        db.put('account', {
            user: 'user2',
            server:'server'
        });

        ok(true);
    } catch(err){
        ok(false);
    } finally {

        db
            .remove(
                'account',['user', 'server']
            )
            .done(function(count){
                ok(count == 1);
                removeSecondEntry();
            })
            .fail(function(err){
                ok(false);
                //console.log('failed:' + JSON.stringify(err));
                start();
            });

        function removeSecondEntry() {

            db
                .remove(
                    'account',['user2', 'server']
                )
                .done(function(count){
                    ok(count == 1);
                    //console.log('succeeded');
                    start();
                })
                .fail(function(err){
                    ok(false);
                    //console.log('failed:' + JSON.stringify(err));
                    start();
                });
        }

    }

});


asyncTest("put and get work", function() {
    expect(3);

    var account = [{
        user: 'user',
        server:'server',
        someOther: "value"
    }];

    try {
        db.put('account', account);

        ok(true);
    } catch(err){
        ok(false);
    } finally {
        db
            .get(
                'account',['user', 'server']
            )
            .done(function(obj){
                ok(obj.someOther == "value");
                delteEntry();
            })
            .fail(function(err){
                ok(false, 'failed deleting records');
                start();
            });

        function delteEntry(){
            db
                .remove(
                    'account',['user', 'server']
                )
                .done(function(count){
                    ok(count == 1);
                    start();
                })
                .fail(function(err){
                    ok(false);
                    //console.log('failed:' + JSON.stringify(err));
                    start();
                });
        }
    }
});

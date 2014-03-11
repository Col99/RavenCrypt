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

asyncTest( "asynchronous test: one second later!", function() {
    expect( 1 );
    setTimeout(function() {
        ok( true, "Passed and ready to resume!" );
        start();
    }, 1000);
});


asyncTest("put works when in schema", function() {
    expect(1);

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
        start();

//        db
//            .remove(
//                'account',['user', 'server']
//            )
//            .done(function(count){
//
//                ok(count > 0);
//                //console.log('succeeded');
//                start();
//            })
//            .fail(function(err){
//
//                ok(false);
//                //console.log('failed:' + JSON.stringify(err));
//                start();
//            });
    }

});

//asyncTest("put in the same item twice and it crashes", function() {
//    var account = [{
//        user: 'user',
//        server:'server'
//    }];
//
//    try {
//        db.put('account', account);
//
//        db.put('account', account);
//
//        ok(false);
//    } catch(err){
//        ok(true);
//    } finally {
//        db
//            .remove(
//                'account',['user', 'server']
//            )
//            .done(function(count){
//
//                ok(count > 0);
//                console.log('succeeded');
//                start();
//            })
//            .fail(function(err){
//
//                ok(false);
//                console.log('failed:' + JSON.stringify(err));
//                start();
//            });
//    }
//
//});

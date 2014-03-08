//https://github.com/yathit/ydn-db

var schema = {
    stores: [
        {
            name: 'account',
            keyPath: ['user', 'server'],
            indexes: [{
                name: 'user'
            }, {
                name: 'server'
            }]
        }, {
            name: 'userKeyPair',
            keyPath: ['user', 'server']
        }, {
            name: 'userKeyPair',
            keyPath: ['user', 'server', 'id']
        }, {
            name: 'files',
            keyPath: ['name', 'server', 'hash']
        }, {
            name: 'conversationAttendee',
            keyPath: ['user', 'server', 'conversationID']
        }, {
            name: 'contact',
            keyPath: ['user', 'server', 'contactName', 'contactServer']
        }, {
            name: 'contactPubKey',
            keyPath: ['user', 'server', 'contactName', 'contactServer', 'id']
        }]
};


//angular.module('ydndb', [])
//    .factory('database', function() {
//        return new ydn.db.Storage('feature-matrix', schema);
//    });



//options = {
//    Encryption: {
//        expiration: 1000*60*60*24, // expires in one day
//        secrets: [{
//            name: 'key1',
//            key: 'aYHF6vfuGHpfWSeRLrPQxZjS5c6HjCscqDqRtZaspJWSMGaW'
//        }]
//    },
//    mechanisms: ['indexeddb', 'websql', 'localstorage', 'sessionstorage', 'userdata', 'memory'], // default ordering
//    size: 2 * 1024 * 1024, // 2 MB //estimated database size in bytes (used only by WebSQL).
//};

//http://stackoverflow.com/questions/19788550/how-to-use-encryption-in-ydn-db-database-library

//never expire, only use indexeddb and localstorage
//the encrytpion here could possibly replace openpgp private key encryption, since you can have one big key for every openpgp key!
//allready encrypted keys can be stored together with their password
var options = {
    Encryption: {
        //expiration: 1000 * 15, //  optional data expiration in ms.
        secrets: [{
            name: 'aaaa',
            key: 'aYHF6vfuGHpfWS*eRLrPQxZjSó~É5c6HjCscqDqRtZasp¡JWSMGaW'
        }]
    },
    mechanisms: ['indexeddb', 'websql', 'localstorage'], // default ordering
    size: 2 * 1024 * 1024 *100 //200MB to fuck up your iphone. ;-)
};


var db = new ydn.db.Storage('RavenCrypt2', schema, options);


//player_data = [{
//    id: 1,
//    health: 50,
//    weapon: 'gun',
//    first: 'A',
//    last: 'Z',
//    full_name: 'A Z',
//    sex: 'FEMALE',
//    age: 24,
//    country: 'SG'
//}, {
//    id: 2,
//    health: 50,
//    weapon: 'gun',
//    first: 'B',
//    last: 'Z',
//    full_name: 'B Z',
//    sex: 'FEMALE',
//    age: 18,
//    country: 'US'
//}, {
//    id: 3,
//    health: 50,
//    weapon: 'laser',
//    first: 'C',
//    last: 'Z',
//    full_name: 'C Z',
//    sex: 'MALE',
//    age: 19,
//    country: 'SG'
//}, {
//    id: 4,
//    health: 50,
//    weapon: 'sword',
//    first: 'D',
//    last: 'Z',
//    full_name: 'D Z',
//    sex: 'FEMALE',
//    age: 19,
//    country: 'SG'
//}];
//var weapon_data = [{
//    name: 'gun',
//    count: 5
//}, {
//    name: 'sword',
//    count: 10
//}, {
//    name: 'laser',
//    count: 1
//}];
//
//
//db.put('player', player_data);
//db.put('weapon', weapon_data);
//
//
//var log_them = function(pid, sno) {
//    db.get('player', pid).done(function(player) {
//        console.log([sno, 'player', player]);
//        db.get('weapon', player.weapon).done(function(weapon) {
//            console.log([sno, 'weapon', weapon]);
//        });
//    })
//};
//var change_weapon = function (pid, new_weapon_name, callback) {
//    db.transaction(function tx_change(idb) {
//        console.log('entering transaction');
//        var get_ini_data = idb.get([idb.key('player', pid), idb.key('weapon', new_weapon_name)]);
//        get_ini_data.done(function get_pre_data(data) {
//            console.log('player and new weapon data read');
//            var player = data[0];
//            var new_weapon = data[1];
//            idb.get('weapon', player.weapon).done(function (old_weapon) {
//                console.log('Changing from ' + old_weapon.name + ' to ' + new_weapon.name);
//                new_weapon.count--;
//                old_weapon.count++;
//                player.weapon = new_weapon.name;
//                idb.put('weapon', [new_weapon, old_weapon]);
//                idb.put('player', player).done(function() {
//                    console.log('transaction done.');
//                    callback();
//                });
//            })
//        });
//    }, ['player', 'weapon'], 'readwrite');
//};
//
//
//log_them(1);
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
    //mechanisms: ['indexeddb', 'websql', 'localstorage'], // default ordering

    mechanisms: ['memory'], // default ordering
    size: 2 * 1024 * 1024 *100 //200MB to fuck up your iphone. ;-)
};

var db = new ydn.db.Storage('RavenCrypt-test', schema, options);
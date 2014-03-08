var configJs = require("../config/config.js");
global.config = new configJs.config('test');

var log4js = require('log4js');
global.logger = log4js.getLogger('server');

//crypto libs
require("../lib/crypto.js")

//message constants
require("../lib/constants.js");

//load the validation
require("../lib/validations.js");

global.db = require("../lib/db.js");
require("../lib/model.js");

//this will fill our memory db with tables, if this has not already happened
var synced = false;
function syncFinished(callback) {
    if(!synced)
        global.db.sequelize.sync().done(function(){
            synced = true;
            //console.log("synced");
            callback();
        });
    else
        callback();
}

exports.testUserRegister = function(test){

    syncFinished(function(){

        var publicKeyArmored =
            "-----BEGIN PGP PUBLIC KEY BLOCK-----\n" +
                "Version: OpenPGP.js v.1.20130712\n" +
                "Comment: http://openpgpjs.org\n" +
                "\n" +
                "xk0EUggadQEB/3l05dO5atdzrvCncrdvgFNaO3TBFhYwjSZ+UHHq8TqtSFqh\n" +
                "fsePYd/EWjn9iovWwbMvaxpSS06wCzO9VE5X6S0AEQEAAc0EdXNlcsJcBBAB\n" +
                "CAAQBQJSCBp2CRArF4fC58XRZwAAFSoB/3cb1HXEplhNcVdoE5wvXrIwbstS\n" +
                "F4tBNiB5V1JVgyEzD+SPDqKwBI0X1tjVVtGUYTv5mNpQwAUSy9veGaVp4Mk=\n" +
                "=dzX9\n" +
                "-----END PGP PUBLIC KEY BLOCK-----";

        var activationCode = "1234";

        var hash = openpgp.crypto.hash.sha256(publicKeyArmored);
        var hexHash = openpgp.util.hexstrdump(hash);

        global.model.UserRegister
            .build({
                name: "bbbbbbbbbb",
                displayName: "BBBBBbbbbb",
                activationCode: activationCode,
                publicKey: publicKeyArmored,
                keyID: hexHash
            })
            .save()
            .error(function(err) {
                test.equal(null, JSON.stringify(err), "should not throw error");
                test.done();
            })
            .success(function() {
                test.done();
            });


    });
};

exports.testUserKey = function(test){

    syncFinished(function(){

        var publicKeyArmored =
            "-----BEGIN PGP PUBLIC KEY BLOCK-----\n" +
                "Version: OpenPGP.js v.1.20130712\n" +
                "Comment: http://openpgpjs.org\n" +
                "\n" +
                "xk0EUggadQEB/3l05dO5atdzrvCncrdvgFNaO3TBFhYwjSZ+UHHq8TqtSFqh\n" +
                "fsePYd/EWjn9iovWwbMvaxpSS06wCzO9VE5X6S0AEQEAAc0EdXNlcsJcBBAB\n" +
                "CAAQBQJSCBp2CRArF4fC58XRZwAAFSoB/3cb1HXEplhNcVdoE5wvXrIwbstS\n" +
                "F4tBNiB5V1JVgyEzD+SPDqKwBI0X1tjVVtGUYTv5mNpQwAUSy9veGaVp4Mk=\n" +
                "=dzX9\n" +
                "-----END PGP PUBLIC KEY BLOCK-----";


        var hash = openpgp.crypto.hash.sha256(publicKeyArmored);
        var keyID = openpgp.util.hexstrdump(hash);

        global.model.UserKey
            .build({
                name: "ccc_ccc",
                key: publicKeyArmored,
                keyID: keyID
            })
            .save()
            .error(function(err) {
                test.equal(null, JSON.stringify(err), "should not throw error");
                test.done();
            })
            .success(function() {
                test.done();
            });
    });
};


exports.testServerSessionKey = function(test){

    syncFinished(function(){

        var ServerSessionKey = global.model.ServerSessionKey;
        var rnd = ServerSessionKey.generate();

        ServerSessionKey
            .build({
                key: rnd.key,
                iv: rnd.iv
            })
            .save()
            .error(function(err) {
                test.equal(null, JSON.stringify(err), "should not throw error");
                test.done();
            })
            .success(function(serverKey) {
                var dataJSON = {name: "lol", validUntil: new Date()};
                var testString = JSON.stringify(dataJSON);

                var encrypted = serverKey.encrypt(testString);
                var decrypted = serverKey.decrypt(encrypted);

                test.equal(decrypted, testString, "should be same");

                test.done();
            });


    });
};



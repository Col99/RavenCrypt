/**
 * Totally insane full route test.
 * This basically tests the whole server.
 *
 * This is maybe to much to be a unit tests, but as long as it works.. :-)
 */



var configJs = require("../config/config.js");
global.config = new configJs.config('test');

global.cluster = require('cluster');
global.clusterStores = configJs.clusterStores;

//next lets set up our logger so we can see whats going on
require("../lib/logger.js")
//logger.setLevel(log4js.levels.OFF);

//crypto libs
require("../lib/crypto.js")

global.db = require("../lib/db.js");
require("../lib/model.js");

//express framework needed for our routes
require("../lib/app.js");

//my little evil helpers.. :-)
require("../lib/helper.js");

//message constants
require("../lib/constants.js");

//load the validation
require("../lib/validations.js");

var http = require('http');
var httpServer = http.createServer(global.app);
global.server = httpServer;

//sessionKeys
require("../lib/session.js");

//sockets..
require("../lib/socket.js");

var routes = require("../lib/routes.js");

//function createUserSessionKey(name){
//    var ServerSessionKey = global.session.skeys[global.session.skeyIDs[0]];
//    var valid = new Date();
//    var validUntil = valid.setDate(valid.getDate() + global.config.session.KeyRenewInterval);
//
//    //create a session for our user
//    var session = {name: name, validUntil: validUntil };
//    var sessionJSON = JSON.stringify(session);
//
//    var encryptedSession = ServerSessionKey.encrypt(sessionJSON);
//
//    var session = {
//        sessionKeyID: ServerSessionKey.id,
//        encrypted: encryptedSession
//    }
//}

//this will fill our memory db with tables, if this has not already happened
var synced = false;
function syncFinished(callback) {

    function updateSessionKeys(){
        global.session.updateKeys(function(){
           callback(session);
        });
    }

    if(!synced)
        global.db.sequelize.sync().done(function(){
            synced = true;
            //console.log("synced");
            updateSessionKeys();
        });
    else
        updateSessionKeys();
}

//response tester.. evil little function to test the routes.
//extend when necessary, or build something better :-)
var Response = function(test) {
    //private:
    function parseArgs(caller, args) {
        //this is crazy. love that this works :-)
        if(args.length > 1) {
            caller.status = args[0];
            caller.msg = args[1];
        } else if(args.length > 0){
            caller.status = 200;
            caller.msg = args[0];
        }
    }
    //public:
    this.status = 0;
    this.msg = null;
    this.isJson = false;

    //overwrite these
    this.ok = function(res){}; //msg is ok
    this.notOk = function(res){}; //the message is not ok
    this.error = function(res){}; //the server responded with an
    this.formatError = function(msg) {
        test.equal(null, msg, "there was a format error");
        return test.done();
    }; //the format the server responded in is incorrect


    this.callback = function(res){
        switch(res.status)
        {
            case 200:
                if(this.isJson) {
                    try{
                        res.json = JSON.parse(res.msg);
                    } catch(err) {
                        this.formatError("should return json");
                    }
                }
                this.ok(this);

                break;
            case 500:
                // Server side error
                this.notOk(this);
                break;
            case 400:
                //something went wrong, read the text!
                this.notOk(this);
                break;
            case 401:
                //not authenticated
                this.notOk(this);
                break;
            default:
                //everything else
                this.error(this);
        }
    }

    this.json = function(){
        parseArgs(this, arguments);
        this.isJson = true;
        this.msg = JSON.stringify(this.msg);
        this.callback(this);
    };

    this.send = function(){
        parseArgs(this, arguments);
        this.isJson = false;
        this.callback(this);
    };
    this.end = this.send;

};


exports.testRouteRegister = function(test){

    syncFinished(function(){

        var userName = "register";

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

        testRegister();

        function testRegister(){

            var req = {};

            req.body = {};
            req.body.publicKey = publicKeyArmored;
            req.body.user = userName;
            req.body.keyID = keyID;

            var res = new Response(test);
            res.ok = function (res){
                return test.done();
            }
            res.notOk = function(res){
                test.equal(null, res.msg, "should have been ok");
                return test.done();
            }
            res.error = function(res){
                test.equal(null, res.msg, "should have no error");
                return test.done();
            }

            try{
                routes.register.register(req, res);
                userName = userName.toLowerCase();
            } catch (err) {
                test.equal(null, JSON.stringify(err), "should throw no error: " + err);
                test.done();
                return;
            }
        }
    });

};


exports.testRouteRegisterConfirm = function(test){
    syncFinished(function(){

        var userName = "routeRegisterConfirm";

            var privateKeyArmored =
                "-----BEGIN PGP PRIVATE KEY BLOCK-----\n" +
                "Version: OpenPGP.js v.1.20130712\n" +
                "Comment: http://openpgpjs.org\n" +
                "\n" +
                "xcA4BFIIGnUBAf95dOXTuWrXc67wp3K3b4BTWjt0wRYWMI0mflBx6vE6rUha\n" +
                "oX7Hj2HfxFo5/YqL1sGzL2saUktOsAszvVROV+ktABEBAAEAAf9jubMXxC/Q\n" +
                "1gC3QpYzvc69IeKdvAjZkWXkTGTbFJCbnxbHfMRG0+j3DbFXtY+eKmQXvrWy\n" +
                "DKjPaYCO39rfkHNBAQDFv7+qwEt9cPYJFTxm98wqHrcrdwNcPDg1Rnu4/xfN\n" +
                "3QEAnTvw59D5FByRB8XuOlzcP8bifkoGUVXyCfYaYhheG5EA/2yULvjqU56y\n" +
                "4vUcAJ36Q1F28EWWfoQqIsqYxcANcMIVU+DNBHVzZXLCXAQQAQgAEAUCUgga\n" +
                "dgkQKxeHwufF0WcAABUqAf93G9R1xKZYTXFXaBOcL16yMG7LUheLQTYgeVdS\n" +
                "VYMhMw/kjw6isASNF9bY1VbRlGE7+ZjaUMAFEsvb3hmlaeDJ\n" +
                "=+nVB\n" +
                "-----END PGP PRIVATE KEY BLOCK-----";

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


//        var keyPair = openpgp.generate_key_pair(1, 1024, "test@test.test");
//
//        var privateKeyArmored = keyPair['privateKeyArmored'];
//        var publicKeyArmored = keyPair['publicKeyArmored'];

        var hash = openpgp.crypto.hash.sha256(publicKeyArmored);
        var keyID = openpgp.util.hexstrdump(hash);

        testRegister();

        function testRegister(){

            var req = {};

            req.body = {};
            req.body.publicKey = publicKeyArmored;
            req.body.user = userName;
            req.body.keyID = keyID;

            var res = new Response(test);
            res.ok = function (res){
                test.ok(res.msg.length > 4, "should be a base64 captcha png");

                //logger.info(activationCodeCaptcha);
                //well shit getting an activation code from a captcha is impossible if done right :D

                //this is the "test" code if the environment ist "test"
                var activationCode = "1111";
                console.log(activationCode);

                testConfirm(activationCode);
            }
            res.notOk = function(res){
                test.equal(null, res.json, "should have been ok");
                return test.done();
            }
            res.error = function(res){
                test.equal(null, res.json, "should have no error");
                return test.done();
            }

            try{
                routes.register.register(req, res);
                userName = userName.toLowerCase();
            } catch (err) {
                test.equal(null, JSON.stringify(err), "should throw no error: " + err);
                test.done();
                return;
            }
        }

        function testConfirm(activationCode){

            var privateKeys = openpgp.key.readArmored(privateKeyArmored);
            var signed = openpgp.signClearMessage(privateKeys.keys, activationCode);

            var req = {};
            req.body = {};

            req.body.user = userName;
            req.body.activationCode = signed;

            var res = new Response(test);
            res.ok = function (res){
                return test.done();
            }
            res.notOk = function(res){
                test.equal(null, res.msg, "should have been ok");
                return test.done();
            }
            res.error = function(res){
                test.equal(null, res.msg, "should have no error");
                return test.done();
            }

            try{
                routes.register.confirm(req, res);
            } catch (err) {
                test.equal(null, JSON.stringify(err), "should throw no error: " + err);
                test.done();
                return;
            }
        }
    });
};


exports.testRouteRegisterConfirmLogin = function(test){
    syncFinished(function(){
        //important when using login! alternative: build a key and add it to global.session.keys
        global.session.updateKeys(function(err){
            if(err){
                test.ok(false, "no keys cant login!")
                test.done();
            }

            var userName = "registerConfirmLogin";

            var privateKeyArmored =
                "-----BEGIN PGP PRIVATE KEY BLOCK-----\n" +
                "Version: OpenPGP.js v.1.20130712\n" +
                "Comment: http://openpgpjs.org\n" +
                "\n" +
                "xcA4BFIIGnUBAf95dOXTuWrXc67wp3K3b4BTWjt0wRYWMI0mflBx6vE6rUha\n" +
                "oX7Hj2HfxFo5/YqL1sGzL2saUktOsAszvVROV+ktABEBAAEAAf9jubMXxC/Q\n" +
                "1gC3QpYzvc69IeKdvAjZkWXkTGTbFJCbnxbHfMRG0+j3DbFXtY+eKmQXvrWy\n" +
                "DKjPaYCO39rfkHNBAQDFv7+qwEt9cPYJFTxm98wqHrcrdwNcPDg1Rnu4/xfN\n" +
                "3QEAnTvw59D5FByRB8XuOlzcP8bifkoGUVXyCfYaYhheG5EA/2yULvjqU56y\n" +
                "4vUcAJ36Q1F28EWWfoQqIsqYxcANcMIVU+DNBHVzZXLCXAQQAQgAEAUCUgga\n" +
                "dgkQKxeHwufF0WcAABUqAf93G9R1xKZYTXFXaBOcL16yMG7LUheLQTYgeVdS\n" +
                "VYMhMw/kjw6isASNF9bY1VbRlGE7+ZjaUMAFEsvb3hmlaeDJ\n" +
                "=+nVB\n" +
                "-----END PGP PRIVATE KEY BLOCK-----";

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


//            var keyPair = openpgp.generate_key_pair(1, 1024, "test@test.test");
//
//            var privateKeyArmored = keyPair['privateKeyArmored'];
//            var publicKeyArmored = keyPair['publicKeyArmored'];

            var hash = openpgp.crypto.hash.sha256(publicKeyArmored);
            var keyID = openpgp.util.hexstrdump(hash);

            testRegister();

            function testRegister(){

                var req = {};

                req.body = {};
                req.body.publicKey = publicKeyArmored;
                req.body.user = userName;
                req.body.keyID = keyID;

                var res = new Response(test);
                res.ok = function (res){
                    test.ok(res.msg.length > 4, "should be a base64 captcha png");

                    //logger.info(activationCodeCaptcha);
                    //well shit getting an activation code from a captcha is impossible if done right :D

                    //this is the "test" code if the environment ist "test"
                    var activationCode = "1111";
                    console.log(activationCode);

                    testConfirm(activationCode);
                }
                res.notOk = function(res){
                    test.equal(null, res.msg, "should have been ok");
                    return test.done();
                }
                res.error = function(res){
                    test.equal(null, res.msg, "should have no error");
                    return test.done();
                }

                try{
                    routes.register.register(req, res)
                    userName = userName.toLowerCase();
                } catch (err) {
                    test.equal(null, JSON.stringify(err), "should throw no error: " + err);
                    test.done();
                    return;
                }
            }

            function testConfirm(activationCode){

                var privateKeys = openpgp.key.readArmored(privateKeyArmored);
                var signed = openpgp.signClearMessage(privateKeys.keys, activationCode);

                var req = {};
                req.body = {};

                req.body.user = userName;
                req.body.activationCode = signed;

                var res = new Response(test);
                res.ok = function (res){
                    testLogin();
                }
                res.notOk = function(res){
                    test.equal(null, res.msg, "should have been ok");
                    return test.done();
                }
                res.error = function(res){
                    test.equal(null, res.msg, "should have no error");
                    return test.done();
                }

                try{
                    routes.register.confirm(req, res);
                } catch (err) {
                    test.equal(null, JSON.stringify(err), "should throw no error: " + err);
                    return test.done();
                }
            }

            function testLogin(){

                var req = {};
                req.body = {};
                req.body.user = userName;
                req.body.keyID = keyID;

                var res = new Response(test);
                res.ok = function (res){

                    var msg = global.helper.pgpDecrypt(res.json, privateKeyArmored)
                    var jsonMsg = JSON.parse(msg);

                    global.helper.hasExactProperties(
                        jsonMsg,
                        "validUntil",
                        "sessionKeyID",
                        "encrypted"
                    );

                    return test.done();

                }
                res.notOk = function(res){
                    test.equal(null, res.msg, "should have been ok");
                    return test.done();
                }
                res.error = function(res){
                    test.equal(null, res.msg, "should have no error");
                    return test.done();
                }

                try{
                    routes.login.login(req, res);
                } catch (err) {
                    test.equal(null, JSON.stringify(err), "should throw no error: " + err);
                    return test.done();
                }
            }
        })
    });
};




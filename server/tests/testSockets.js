//TODO

//
//exports.testSendMessage = function(test){
//    syncFinished(function(session){
//
//        var req = {};
//        req.body = {};
//        req.session = session;
//
//        req.body.receiver = "test2";
//        req.body.receiverServer = null;
//        req.body.sessionID = "random";
//        req.body.version = 0;
//        req.body.keyIDSender = 0;
//        req.body.keyIDReceiver = 0;
//        req.body.message = "lol";
//        req.body.decryptionKey = "key";
//
//
//        var res = new Response(test);
//
//        res.ok = function (res){
//
//            var userNameServerFormatted = userName.toLowerCase();
//            test.equal(res.json.msg.name, userNameServerFormatted);
//
//            test.done();
//
//        }
//        res.notOk = function(res){
//            test.equal(null, res.json.error, "should have be ok");
//            return test.done();
//        }
//        res.error = function(res){
//            test.equal(null, res.json.error, "should have no error");
//            return test.done();
//        }
//
//        global.routes.msg.post(req, res);
//
//
//    });
//};
//
//
//
//

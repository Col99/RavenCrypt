global.session = {};

//our session should be able to completely fail and still not cause any problems to or user :-)

global.session.authenticate = function(sessionInput){
    try{
        global.validations.authenticate(sessionInput);
    } catch(err) {
        throw global.constants.sessionSyntaxIncorrect; //Session syntax incorrect"
    }

    var sessionKey = global.session.skeys[sessionInput.sessionKeyID];
    if(!sessionKey) {
        throw global.constants.sessionKeyNotFound; //No Session Key Found for the sessionKeyID"
    }

    try{
        var sessionJson = sessionKey.decrypt(sessionInput.encrypted);
        if(sessionJson == null || sessionJson == "") {
            throw global.constants.sessionDecryptionFailed;
        }
    } catch(err) {
        throw global.constants.sessionDecryptionFailed; //Decryption failed! (TODO: optional login param to force new connection)
    }

    var session = JSON.parse(sessionJson);
    if(session.validUntil < new Date()) {
        throw global.constants.sessionExpired; //Session has Expired
    }

    return session;
}

global.session.newKey = function(callback){

    var ServerSessionKey = global.model.ServerSessionKey;
    var rnd = ServerSessionKey.generate();

    global.model.ServerSessionKey
        .build({
            key: rnd.key,
            iv: rnd.iv
        })
        .save()
        .success(function(key){
            //add a new key to the beginning of our key array.
            global.session.skeyIDs.unshift(key.id);
            global.session.skeys[key.id] = key;

            global.logger.info("New Session Key: " + key.id);

            if(global.session.skeyIDs.length > 3){
                //remove the 4th key, it should be invalidated now!
                var keyID = global.session.skeyIDs.splice(3,1);
                delete global.session.skeys[keyID];
            }

            callback();
        })
        .error(function(err){
            callback(err);
        });
}


global.session.updateKeys = function(callback){
    global.model.ServerSessionKey
        .findAll({
            order: 'id DESC',
            limit: 3
        })
        .success(function(ServerSessionKeys) {

            var keyMaxAge = new Date() - global.config.session.KeyRenewInterval * 24 * 60 * 60 * 1000; /* ms */

            if(ServerSessionKeys.length > 0 && ServerSessionKeys[0].createdAt > keyMaxAge) {
                global.session.skeys = {};
                global.session.skeyIDs = [];

                for(var i=0;i<ServerSessionKeys.length;i++){
                    var key = ServerSessionKeys[i];
                    global.session.skeyIDs.unshift(key.id);
                    global.session.skeys[key.id] = key;
                }
                global.logger.info("SessionKeyFound, all good!");
                callback();
            } else {
                global.session.skeys = {};
                global.session.skeyIDs = [];
                global.session.newKey(callback);
            }
        });
}

var validations = {};
var openpgp = global.openpgp;
var constants = global.constants;
var helper = global.helper;
var config = global.config;

var rxUser = new RegExp(config.validations.user.regExpText)
var rxDisplayUser = new RegExp(config.validations.user.displayRegExpText)
var rxServer = new RegExp(config.validations.server.regExpText);

//override this if we do tests
if(config.isTestEnvironment()){
    rxServer = {};
    rxServer.test = function() {return true};
}

function isType(prop, type) {
    if(typeof prop != type) {
        throw prop + " was not of type " + type;
    }
}

/**
 * Validations:
 * input data validations could be a little bit overhead, given
 * that the model also does Validations..
 * but nothing is worse then dealing with malformed data :-)
 */

validations.checkPGPKey = function(value){
    try {
        var keys = openpgp.key.readArmored(value);
    } catch (err) {
        throw constants.unreadableKey;
    }
    //this should only contain one public key
    var key = keys.keys[0];

    //key HAS to support signing.
    var signKey = key.primaryKey.algorithm.indexOf('sign');
    if(signKey < 0){
        throw constants.keyCanNotSign;
    }

    //key HAS to support encryption.
    var encryptionKey = key.primaryKey.algorithm.indexOf('encrypt');
    if(encryptionKey < 0) {
        throw constants.keyCanNotEncrypt;
    }

    //TODO: Implement for Release
    //This is a good validation but just a little bit to limiting for the Álpha Version.
    //This Code Should Protect the Server against Users submitting GIANTIC keys that Take forever to work with.
    //Its almost a must for the Release Version, because thi is a good way to fuck us over :)
//    switch(signKey.publicKeyAlgorithm) {
//      case 1:
//          if(config.isTestEnvironment())
//              return;
//
//          function checkKey(key) {
//              //if you want write a better way to get the user Key length in a "cleaner" fashion.
//              //im happy with this for now :-)
//              var mpi0 = key.MPIs[0];
//              var mpiLength = mpi0.mpiBitLength;
//              var keyLength = mpiLength + 1;
//
//              if(keyLength < 2048) {
//                  throw { err: "KeyLengthToShort", msg:"Your RSA Key should have at least 2048 bits!"};
//              }
//              if(keyLength > 4096) {
//                  throw {
//                      err: "KeyLengthToLong",
//                      msg: " Your Key is to gigantic for us!" +
//                           "(Sorry! When our openpgp implementation gets faster (using asm.js maybe?)," +
//                           "this limitation will pushed to support more bits)" +
//                           "The current limit is 4096 bits!"};
//              }
//          }
//          checkKey(encryptionKey);
//          checkKey(signKey);
//
//          break;
//      default :
//          //TODO: find out what are acceptable lengths / strengths for the other algorithms and write some validations for them
//          //http://tools.ietf.org/html/rfc4880#section-9.1
//          //http://tools.ietf.org/html/rfc6637#section-9.1
//          throw {
//              err: "UnsupportedAlgorithm",
//              msg:
//                  "This algorithm is not (yet?) supported. " +
//                  "Choose an algorithm that supports signing." +
//                  "If your algorithm supports signing maybe our server doesn't support it yet."
//
//          }
//      break;
//    }

};

validations.routeComGet = function(data){
    helper.hasExactProperties(
        data,
        "id",
        "name",
        "server",
        "direction"
    );
    isType(data["id"],"string");
    isType(data["name"],"string");
    isType(data["server"],"string");

    if (data["direction"] != "i" &&
        data["direction"] != "o") {
        throw "direction was neither 'i' or 'o'";
    }
};

validations.routeMsgGet = function(data){
    helper.hasExactProperties(
        data,
        "id",
        "name",
        "server",
        "direction"
    );
    isType(data["id"],"string");
    isType(data["name"],"string");
    isType(data["server"],"string");

    if (data["direction"] != "i" &&
        data["direction"] != "o") {
        throw "direction was neither 'i' or 'o'";
    }
};

validations.routeComList = function(data){
    if (data.since) {
        helper.hasExactProperties(
            data,
            "since"
        );
        isType(data["since"],"object");
        if(!isDate(data["since"])){
            throw "since was no date";
        }
    } else {
        helper.hasExactProperties(
            data
        );
    }
};

validations.routeContactList = function(data){
    if (data.since) {
        helper.hasExactProperties(
            data,
            "since"
        );
        isType(data["since"],"object");
        if(!isDate(data["since"])){
            throw "since was no date";
        }
    } else {
        helper.hasExactProperties(
            data
        );
    }
};

validations.routeContactKeyList = function(data){
    if (data.since) {
        helper.hasExactProperties(
            data,
            "since"
        );
        isType(data["since"],"object");
        if(!isDate(data["since"])){
            throw "since was no date";
        }
    } else {
        helper.hasExactProperties(
            data
        );
    }
};

validations.routeMsgList = function(data){
    if (data.since) {
        helper.hasExactProperties(
            data,
            "since"
        );
        isType(data["since"],"object");
        if(!isDate(data["since"])){
            throw "since was no date";
        }
    } else {
        helper.hasExactProperties(
            data
        );
    }
};


validations.routeComSave = function(data){
    helper.hasExactProperties(
        data,
        "id",
        "senderKeyID",
        "receiver",
        "receiverServer",
        "receiverKeyID",
        "text"
    );
    isType(data["id"],"string");
    isType(data["senderKeyID"],"string");
    isType(data["receiver"],"string");
    isType(data["receiverServer"],"string");
    isType(data["receiverKeyID"],"string");
    isType(data["text"],"string");

    if (data["sender"] == data["receiver"] &&
        config.web.serverName == data["receiverServer"] ){
        throw constants.senderReceiverAreSame;
    }
};

validations.routeMsgSave = function(data){
    helper.hasExactProperties(
        data,
        "id",
        "senderKeyID",
        "receiver",
        "receiverServer",
        "receiverKeyID",
        "text",
        "key"
    );
    isType(data["id"],"string");
    isType(data["senderKeyID"],"number");
    isType(data["receiver"],"string");
    isType(data["receiverServer"],"string");
    isType(data["receiverKeyID"],"number");
    isType(data["text"],"string");
    isType(data["key"],"string");

    if (data["sender"] == data["receiver"] &&
        config.web.serverName == data["receiverServer"] ){
        throw constants.senderReceiverAreSame;
    }
};

validations.routeBlogDelete = function(data){
    helper.hasExactProperties(
        data,
        "signKeyID",
        "text"
    );
    isType(data["signKeyID"],"string");
    isType(data["text"],"string");

    try {
        openpgp.read_message(data["text"]);
    } catch(err) {
        throw constants.noPGPMsg;
    }
};

validations.routeFileDelete = function(data){
    helper.hasExactProperties(
        data,
        "signKeyID",
        "text"
    );
    isType(data["signKeyID"],"string");
    isType(data["text"],"string");

    try {
        openpgp.read_message(data["text"]);
    } catch(err) {
        throw constants.noPGPMsg;
    }
};

validations.routeContactRelationDelete = function(data){
    helper.hasExactProperties(
        data,
        "name",
        "server"
    );
    isType(data["name"],"string");
    isType(data["server"],"string");

    if(!rxUser.test(data["name"])){
        throw constants.incorrectUserNameFormat;
    }
};

validations.routeContactDelete = function(data){
    helper.hasExactProperties(
        data,
        "name",
        "server"
    );
    isType(data["name"],"string");
    isType(data["server"],"string");

    if(!rxUser.test(data["name"])){
        throw constants.incorrectUserNameFormat;
    }
};

validations.routeContactKeyDelete = function(data){
    helper.hasExactProperties(
        data,
        "name",
        "server",
        "keyID"
    );
    isType(data["name"],"string");
    isType(data["server"],"string");
    isType(data["keyID"],"string");

    if(!rxUser.test(data["name"])){
        throw constants.incorrectUserNameFormat;
    }
};

validations.routeBlogPost = function(data){
    helper.hasExactProperties(
        data,
        "signKeyID",
        "id",
        "text"
    );
    isType(data["signKeyID"],"string");
    isType(data["id"],"string");
    isType(data["text"],"string");

    try {
        openpgp.read_message(data["text"]);
    } catch(err) {
        throw constants.noPGPMsg;
    }
};

validations.routeContactRelationUpsert = function(data){
    helper.hasExactProperties(
        data,
        "signKeyID",
        "name",
        "server",
        "text"
    );
    isType(data["signKeyID"],"string");
    isType(data["name"],"string");
    isType(data["server"],"string");
    isType(data["text"],"string");

    try {
        openpgp.read_message(data["text"]);
    } catch(err) {
        throw constants.noPGPMsg;
    }

    if(!rxUser.test(data["name"])){
        throw constants.incorrectUserNameFormat;
    }
};

validations.routeContactUpsert = function(data){
    helper.hasExactProperties(
        data,
        "name",
        "server",
        "keepComAlive",
        "comKeyCount"
    );
    isType(data["name"],"string");
    isType(data["server"],"string");
    isType(data["keepComAlive"],"boolean");
    isType(data["comKeyCount"],"number");

    if(!rxUser.test(data["name"])){
        throw constants.incorrectUserNameFormat;
    }
};

validations.routeContactKeyUpsert = function(data){
    helper.hasExactProperties(
        data,
        "name",
        "server",
        "keyID",
        "key",
        "verification",
        "verificationSignKeyID",
        "forCom"
    );
    isType(data["name"],"string");
    isType(data["server"],"string");
    isType(data["keyID"],"string");
    isType(data["key"],"string");
    isType(data["verification"],"string");
    isType(data["verificationSignKeyID"],"string");
    isType(data["forCom"],"boolean");

    if(!rxUser.test(data["name"])){
        throw constants.incorrectUserNameFormat;
    }
};

validations.routeFileUpload = function(data){
    if(data.encryption) {
        helper.hasExactProperties(
            data,
            "hash",
            "signature",
            "signKeyID",
            "encryption"
        );
        isType(data["hash"],"string");
        isType(data["signature"],"string");
        isType(data["signKeyID"],"string");
        isType(data["encryption"],"string");
    } else {
        helper.hasExactProperties(
            data,
            "hash",
            "signature",
            "signKeyID"
        );
        isType(data["hash"],"string");
        isType(data["signature"],"string");
        isType(data["signKeyID"],"string");
    }
};


validations.routeRegister = function(data){
    helper.hasExactProperties(
        data,
        "user",
        "publicKey",
        "keyID"
    );
    isType(data["user"],"string");
    isType(data["publicKey"],"string");
    isType(data["keyID"],"string");

    if(!rxDisplayUser.test(data["user"])){
        throw constants.incorrectUserNameFormat;
    }
};

validations.routeRegisterConfirm = function(data){
    helper.hasExactProperties(
        data,
        "user",
        "activationCode"
    );
    isType(data["user"],"string");
    isType(data["activationCode"],"string");

    if(!rxUser.test(data["user"])){
        throw constants.incorrectUserNameFormat;
    }
};

validations.authenticate = function(data){
    helper.hasExactProperties(
        data,
        "sessionKeyID",
        "encrypted"
    );
    isType(data["sessionKeyID"],"number");
    isType(data["encrypted"],"string");
};

validations.routeExists = function(data){
    helper.hasExactProperties(
        data,
        "name"
    );
    isType(data["name"],"string");

    if(!rxUser.test(data["name"])){
        throw constants.incorrectUserNameFormat;
    }
};

validations.routeFileGet = function(data){
    if(data.encParams) {
        helper.hasExactProperties(
            data,
            "user",
            "hash",
            "encParams"
        );
        isType(data["encParams"],"boolean")
    } else {
        helper.hasExactProperties(
            data,
            "user",
            "hash"
            );
    }
    isType(data["user"],"string");
    isType(data["hash"],"string");

    if(!rxUser.test(data["name"])){
        throw constants.incorrectUserNameFormat;
    }
};

validations.routeBlogList = function(data){
    if(!data.since) {
        helper.hasExactProperties(
            data,
            "user"
        );
        isType(data["user"],"string");
    } else {
        helper.hasExactProperties(
            data,
            "user",
            "since",
            "direction"
        );
        isType(data["user"],"string");
        isType(data["since"],"object");
        isType(data["direction"],"string");
        if(data.direction != "gt" && data.direction != "lt") {
            throw "direction is neither gt or lt"
        }
    }

    if(!rxUser.test(data["user"])){
        throw constants.incorrectUserNameFormat;
    }
};

validations.routeBlogGet = function(data){
    helper.hasExactProperties(
        data,
        "user",
        "id"
    );
    isType(data["user"],"string");
    isType(data["id"],"string");

    if(!rxUser.test(data["user"])){
        throw constants.incorrectUserNameFormat;
    }
};

validations.routeRelationList = function(data) {
    if(!data.since) {
        helper.hasExactProperties(
            data,
            "user"
        );
        isType(data["user"],"string");
    } else {
        helper.hasExactProperties(
            data,
            "user",
            "since",
            "direction"
        );
        isType(data["user"],"string");
        isType(data["since"],"object");
        isType(data["direction"],"string");
        if(data.direction != "gt" && data.direction != "lt") {
            throw "direction is neither gt or lt"
        }
    }

    if(!rxUser.test(data["user"])){
        throw constants.incorrectUserNameFormat;
    }
};

validations.routeRelationGet = function(data){
    helper.hasExactProperties(
        data,
        "user",
        "name",
        "server"
    );
    isType(data["user"],"string");
    isType(data["name"],"string");
    isType(data["server"],"string");

    if(!rxUser.test(data["user"])){
        throw constants.incorrectUserNameFormat;
    }
    if(!rxUser.test(data["name"])){
        throw constants.incorrectUserNameFormat;
    }
};

validations.routeContactGet = function(data){
    helper.hasExactProperties(
        data,
        "name",
        "server"
    );
    isType(data["name"],"string");
    isType(data["server"],"string");

    if(!rxUser.test(data["name"])){
        throw constants.incorrectUserNameFormat;
    }
};
validations.routeContactKeyGet = function(data){
    helper.hasExactProperties(
        data,
        "name",
        "server",
        "keyID"
    );
    isType(data["name"],"string");
    isType(data["server"],"string");
    isType(data["keyID"],"string");

    if(!rxUser.test(data["name"])){
        throw constants.incorrectUserNameFormat;
    }
};

validations.routeComReceive = function(data) {
    helper.hasExactProperties(
        data,
        "id",
        "receiver",
        "receiverKeyID",
        "sender",
        "senderServer",
        "senderKeyID",
        "text"
    );
    isType(data["id"],"string");
    isType(data["receiver"],"string");
    isType(data["receiverKeyID"],"string");
    isType(data["sender"],"string");
    isType(data["senderServer"],"string");
    isType(data["senderKeyID"],"string");
    isType(data["text"],"string");

    if(!rxUser.test(data["receiver"])){
        throw constants.incorrectUserNameFormat;
    }
    if(!rxUser.test(data["sender"])){
        throw constants.incorrectUserNameFormat;
    }
    if(!rxServer.test(data["senderServer"])){
        throw constants.incorrectServerFormat;
    }
    if (data["sender"] == data["receiver"] &&
        data["senderServer"] == data["receiverServer"] ){
        throw constants.senderReceiverAreSame;
    }
};

validations.routeMsgReceive = function(data) {
    helper.hasExactProperties(
        data,
        "id",
        "receiver",
        "receiverKeyID",
        "sender",
        "senderServer",
        "senderKeyID",
        "text",
        "key"
    );
    isType(data["id"],"string");
    isType(data["receiver"],"string");
    isType(data["receiverKeyID"],"number");
    isType(data["sender"],"string");
    isType(data["senderServer"],"string");
    isType(data["senderKeyID"],"number");
    isType(data["text"],"string");
    isType(data["key"],"string");

    if(!rxUser.test(data["receiver"])){
        throw constants.incorrectUserNameFormat;
    }
    if(!rxUser.test(data["sender"])){
        throw constants.incorrectUserNameFormat;
    }
    if(!rxServer.test(data["senderServer"])){
        throw constants.incorrectServerFormat;
    }
    if (data["sender"] == data["receiver"] &&
        data["senderServer"] == data["receiverServer"] ){
        throw constants.senderReceiverAreSame;
    }
};

validations.routeUserKeysGet = function(data) {
    helper.hasExactProperties(
        data,
        "name",
        "keyID"
    );
    isType(data["name"],"string");
    isType(data["keyID"],"string");

    if(!rxUser.test(data["name"])){
        throw constants.incorrectUserNameFormat;
    }
};

validations.routeUserKeysList = function(data) {
    helper.hasExactProperties(
        data,
        "name"
    );
    isType(data["name"],"string");

    if(!rxUser.test(data["name"])){
        throw constants.incorrectUserNameFormat;
    }
};

validations.routeUserKeysAdd = function(data) {
    helper.hasExactProperties(
        data,
        "key",
        "keyID",
        "forLogin"
    );
    isType(data["key"],"string");
    isType(data["keyID"],"string");
    isType(data["forLogin"],"string");
};


validations.routeUserKeysDelete = function(data) {
    helper.hasExactProperties(
        data,
        "keyID"
    );
    isType(data["keyID"],"string");
};


validations.login = function(data) {
    helper.hasExactProperties(
        data,
        "user",
        "keyID"
    );
    isType(data["user"],"string");
    isType(data["keyID"],"string");

    if(!rxUser.test(data["user"])){
        throw constants.incorrectUserNameFormat;
    }
};


global.validations = validations;

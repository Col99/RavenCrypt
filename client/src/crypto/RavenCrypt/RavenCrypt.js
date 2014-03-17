//Mini layer to abstract our crypto

//SymmetricAlgorithms:
//0 = AES256

//CompressionAlgorithms:
//0 = Nothing
//1 = LZ-String


var RavenCryptMain = function(){
    this.defaultCompressionAlgorithm = "0";
    this.defaultSymmetricAlgorithm = "0";

    openpgp.config.compression = 0;
    openpgp.config.show_version = false;
    openpgp.config.show_comment = false;
//    openpgp.initWorker("../openpgp/");

};

var RavenCrypt = new RavenCryptMain();

RavenCryptMain.prototype.compress = function(text, algorithm) {
    var compressed;

    switch(algorithm){
        case "0":
            //Nothing

            compressed = "0" + text;
            break;
        case "1":
            //LZ-STRING
            //TODO
            //actually destroys everything currently,
            //we may need to switch everything to utf16 on client + server to use this.
            //only use it if you know what your doing!

            compressed = LZString.compressToUTF16(text);

            compressed = "1" + compressed;
            break;
        default:
            throw "UNKNOWN_RC_COMPRESSION_ALGORITHM";
    }

    return compressed;
}

RavenCryptMain.prototype.decompress = function(compressed) {
    if(compressed.length = 0){
        throw "NO_RC_MESSAGE";
    }

    var text;

    var algorithm = compressed[0];
    compressed = compressed.substring(1);

    switch(algorithm){
        case "0":
            //Nothing

            text = compressed;
            break;
        case "1":
            //LZ-STRING

            text = LZString.decompressFromUTF16(text);

            break;
        default:
            throw "UNKNOWN_RC_COMPRESSION_ALGORITHM";
    }

    return text;
};

var RavenCryptSymmetricKey = function (algorithm, key, iv){
    //constructor
    this.algorithm = algorithm;
    this.key = key;
    this.iv = iv;

    return this;
};

RavenCryptSymmetricKey.prototype.encrypt = function(text){
    if(typeof text != "string") {
        text = text + "";
    }

    switch(this.algorithm){
        case "0":
            //AES256

            var symmAlgo = "aes256"; // AES256

            var encrypted = openpgp.crypto.cfb.normalEncrypt(symmAlgo, this.key, text, this.iv);
//                encrypted = openpgp.util.encode_utf8(encrypted);

            return encrypted;

            break;
        default:
            throw 'UNKNOWN_RC_SYMMETRIC_ALGORITHM';
    }
};

RavenCryptSymmetricKey.prototype.decrypt = function(encrypted){
    switch(this.algorithm){
        case "0":
            //AES256

            var symmAlgo = "aes256"; // AES256 //                encrypted = openpgp.util.decode_utf8(encrypted);
            var decrypted = openpgp.crypto.cfb.normalDecrypt(symmAlgo, this.key , encrypted, this.iv);


            return decrypted;

            break;
        default:
            throw 'UNKNOWN_RC_SYMMETRIC_ALGORITHM';
    }
};

RavenCryptSymmetricKey.createNew = function(algorithm, half){
    //static function

    if(!algorithm) {
        //we choose the latest algorithm that we know
        algorithm = RavenCrypt.defaultSymmetricAlgorithm;
    }

    var key;
    var iv;

    switch(algorithm){
        case "0":
            //AES256

            var symmAlgo = "aes256"; // AES256
            if(half) {
                symmAlgo = "aes128"; // AES128
            }

            key = openpgp.crypto.generateSessionKey(symmAlgo);
            iv = openpgp.crypto.generateSessionKey(symmAlgo);

            break;
        default:
            throw 'UNKNOWN_RC_SYMMETRIC_ALGORITHM';
    }

    return new RavenCryptSymmetricKey(algorithm, key, iv);
}




var RavenCryptComKey = function (){

    this.id = null;
    this.algorithm = null;
    this.keyHalf = null;
    this.ivHalf = null;

    return this;
};


RavenCryptComKey.prototype.compress = function() {
    var jsonText = JSON.stringify(this);
    return RavenCrypt.compress(jsonText, RavenCrypt.defaultCompressionAlgorithm);
};

RavenCryptComKey.prototype.fill = function(objContactComKey){
    this.id = objContactComKey.id;
    this.algorithm = objContactComKey.algorithm;
    this.keyHalf = objContactComKey.keyHalf;
    this.ivHalf = objContactComKey.ivHalf;
};

RavenCryptComKey.prototype.combine = function(comKey){
    //instance function

    if(this.algorithm != comKey.algorithm) {
        throw "NO_MATCHING_COM_ALGORITHMS";
    }

    var key = this.keyHalf + comKey.keyHalf;
    var iv = this.ivHalf + comKey.ivHalf;

    switch(this.algorithm){
        case "0":

            //AES256

            //Explanation:
            //We do a round of sha256 here, to mix things up.
            //It could be bad if we only string the keys together.

            var keySecured = openpgp.crypto.hash.sha256(key);
            var ivSecured = openpgp.crypto.hash.sha256(iv);

            return new RavenCryptSymmetricKey(this.algorithm, keySecured, ivSecured);

            break;
        default:
            throw 'UNKNOWN_RC_SYMMETRIC_ALGORITHM';
    }
};

RavenCryptComKey.decompress = function(text) {
    return RavenCryptComKey.parse(RavenCrypt.decompress(text));
};

RavenCryptComKey.parse = function(jsonContactComKey){
    var objContactComKey = JSON.parse(jsonContactComKey);
    return RavenCryptComKey.fillNew(objContactComKey);
};

RavenCryptComKey.fillNew = function(objContactComKey){
    var rcComKey = new RavenCryptComKey();

    rcComKey.fill(objContactComKey);

    return rcComKey;
};

RavenCryptComKey.createNew = function(id, algorithm){
    //static function

    var rcComKey = new RavenCryptComKey();

    rcComKey.id = id;

    if(!algorithm) {
        //we choose the latest algorithm that we know
        rcComKey.algorithm = RavenCrypt.defaultSymmetricAlgorithm;
    } else {
        rcComKey.algorithm = algorithm;
    }

    switch(rcComKey.algorithm){
        case "0":

            //AES256
            //TODO 20.20

            var symKey = RavenCryptSymmetricKey.createNew(rcComKey.algorithm, true);

            rcComKey.keyHalf = symKey.key;
            rcComKey.ivHalf = symKey.iv;

            return rcComKey;
            break;
        default:
            throw 'UNKNOWN_RC_SYMMETRIC_ALGORITHM';
    }

}



var RavenCryptAsymmetricPrivateKey = function (privateKeyArmored, passPhrase){
    //constructor
    this.privateKeyAmored = privateKeyArmored;
    this.parsedPrivateKeys = openpgp.key.readArmored(privateKeyArmored);
    this.parsedPrivateKeys.keys[0].decrypt(passPhrase);

    return this;
};

RavenCryptAsymmetricPrivateKey.prototype.sign = function(text){
    if(typeof text != "string") {
        text = text + "";
    }
    return openpgp.signClearMessage(this.parsedPrivateKeys.keys, text);
};

RavenCryptAsymmetricPrivateKey.prototype.decrypt = function(text){
    var msg = openpgp.message.readArmored(text);
    var decrypted = openpgp.decryptMessage(this.parsedPrivateKeys.keys[0], msg);

    return decrypted;
};

RavenCryptAsymmetricPrivateKey.prototype.decryptAndVerify = function(text, pubKeysParsed){

    var msg = openpgp.message.readArmored(text);

    var decrypted = openpgp.decryptAndVerifyMessage(this.parsedPrivateKeys.keys[0], pubKeysParsed.keys, msg);

    if (decrypted.signatures.length == 0) {
        throw "INVALID_SIGNATURE";
    }

    for(var i=0; i<decrypted.signatures.length;i++){
        if(!decrypted.signatures[i].valid) {
            throw "INVALID_SIGNATURE"
        }
    }

    return decrypted.text;
};


var RavenCryptAsymmetricPublicKey = function (publicKeyArmored){
    this.publicKeyArmored = publicKeyArmored;
    this.parsedPublicKeys = openpgp.key.readArmored(publicKeyArmored);

    return this;
};

RavenCryptAsymmetricPublicKey.prototype.encrypt = function(text){
    return openpgp.encryptMessage(this.parsedPublicKeys.keys, text);
}

RavenCryptAsymmetricPublicKey.prototype.signAndEncrypt = function(text, parsedPrivateKeys){
    return openpgp.signAndEncryptMessage(this.parsedPublicKeys.keys, parsedPrivateKeys.keys[0], text);
}

RavenCryptAsymmetricPublicKey.prototype.readAndVerify = function(text){
    var clearText = openpgp.cleartext.readArmored(text);
    var verified = openpgp.verifyClearSignedMessage(this.parsedPublicKeys.keys, clearText);

    if (verified.signatures.length == 0) {
        throw "INVALID_SIGNATURE";
    }

    for(var i=0; i<verified.signatures.length;i++){
        if(!verified.signatures[i].valid) {
            throw "INVALID_SIGNATURE"
        }
    }

    return verified.text;
};

RavenCryptAsymmetricPublicKey.prototype.getKeyID = function(){
    var hash = openpgp.crypto.hash.sha256(this.publicKeyArmored);
    var keyID = openpgp.util.hexstrdump(hash);
    return keyID;
};

var RavenCryptAsymmetricKeyPair = function (){
    //fields for client database
    this.id = null;
    this.publicKeyArmored = "";
    this.privateKeyArmored = "";
    this.keyID = "";

    //actual instances to work with
    this.publicKey = null;
    this.privateKey = null;

    return this;
};

RavenCryptAsymmetricKeyPair.createRSAKeyPair = function(userIdForPublicKeyServer, keyLength, passPhrase){
    if(!userIdForPublicKeyServer) {
        throw "NO_USERID_GIVEN";
    }

    if(!keyLength)
        keyLength = 2048;

    return openpgp.generateKeyPair(1, keyLength, userIdForPublicKeyServer, passPhrase);
};

RavenCryptAsymmetricKeyPair.createNew = function(openPGPKeyPair, passPhrase){

    if(typeof passPhrase == "undefined"){
        passPhrase = "";
    }

    var instance = new RavenCryptAsymmetricKeyPair();

    instance.publicKeyArmored = openPGPKeyPair.publicKeyArmored;
    instance.privateKeyArmored = openPGPKeyPair.privateKeyArmored;

    instance.publicKey = new RavenCryptAsymmetricPublicKey(instance.publicKeyArmored);
    instance.privateKey = new RavenCryptAsymmetricPrivateKey(instance.privateKeyArmored, passPhrase);

    instance.keyID = instance.publicKey.getKeyID();

    return instance;
};


var RavenCryptMessage = function(myComKey, contactComKey){
    //constructor
    this.receiveKey = contactComKey.combine(myComKey);
    this.sendKey = myComKey.combine(contactComKey);

    return this;
};

RavenCryptMessage.prototype.encrypt = function(text, algorithm){

    if(!algorithm) {
        this.algorithm = RavenCrypt.defaultSymmetricAlgorithm;
    } else {
        this.algorithm = algorithm;
    }

    var text = RavenCrypt.compress(text, RavenCrypt.defaultCompressionAlgorithm);

    switch(this.algorithm){
        case "0":
            //AES256


            var messageKey = RavenCryptSymmetricKey.createNew(algorithm);
            var encryptedText = messageKey.encrypt(text);

            var key =  openpgp.util.hexstrdump(messageKey.key);
            var iv =  openpgp.util.hexstrdump(messageKey.iv);

            var jsonMessageKey = JSON.stringify({algorithm: this.algorithm, key: key, iv: iv});
            var encryptedMessageKey = this.sendKey.encrypt(jsonMessageKey);

            return {message: encryptedText, messageKey: encryptedMessageKey}

            break;
        default:
            throw 'UndefinedAlgorithm';
    }
};

RavenCryptMessage.prototype.decrypt = function(text, messageKey){

    var jsonMessageKey = this.receiveKey.decrypt(messageKey);
    var objectMessageKey = JSON.parse(jsonMessageKey);

    var parsedKey = openpgp.util.hex2bin(objectMessageKey.key);
    var parsedIv = openpgp.util.hex2bin(objectMessageKey.iv);
    var messageKey = new RavenCryptSymmetricKey(objectMessageKey.algorithm, parsedKey, parsedIv);

    text = messageKey.decrypt(text);

    var text = RavenCrypt.decompress(text);

    return text;
};

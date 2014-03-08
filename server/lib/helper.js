global.helper = {};

/**
 * Ensures that object has the given properties
 * @param object, propertyOne, propertyTwo... N
 * @returns {boolean}
 */
global.helper.hasOwnProperties = function() {
    var obj = arguments[0];
    for (var i=1; i < arguments.length; i++) {
         if(!obj.hasOwnProperty(arguments[i]))
            return false;
    }
    return true;
};

/**
 * Ensures that object has the given properties and only the given properties
 * @param object, propertyOne, propertyTwo... N
 * @returns {boolean}
 */
global.helper.hasExactProperties = function() {
    var obj = arguments[0];
    if(obj == null)
        throw "variable is null";

    var props = [];
    for (var i=1; i < arguments.length; i++) {
        props[i-1] = arguments[i];
    }
    for(var prop in obj) {
        var index = props.indexOf(prop);
        if (index == -1)
            throw "unknown property: " + prop
        props.splice(index, 1);
    }
    if(props.length > 0)
        throw "missing properties: " + JSON.stringify(props);
    return true;
}

/**
 * Encrypts the text with the public Key
 * @param text
 * @param publicKeyArmored
 * @returns {*|String|_openpgp.write_encrypted_message}
 */
global.helper.pgpEncrypt = function(text, publicKeyArmored){
    var publicKeys = openpgp.key.readArmored(publicKeyArmored);
    return openpgp.encryptMessage(publicKeys.keys, text);
}

/**
 * Decrypts the text with the public Key
 * @param text
 * @param privateKeyArmored
 * @returns {.pg.text|*|.sqlite.text|.mysql.text|model.UserProfile.text|model.Blog.text}
 */
global.helper.pgpDecrypt = function(text, privateKeyArmored){
    var privateKeys = openpgp.key.readArmored(privateKeyArmored);
    var msg = openpgp.message.readArmored(text);
    var decrypted = openpgp.decryptMessage(privateKeys.keys[0], msg);

    return decrypted;
}

global.helper.getUTCTime = function(){
    var now = new Date();
    return new Date(now.getTime() + now.getTimezoneOffset() * 60 * 1000);
}

//Save functions, since they should not overflow
global.helper.toArrayBuffer = function(buffer) {
    var ab = new ArrayBuffer(buffer.length);
    var view = new Uint8Array(ab);
    for (var i = 0; i < buffer.length; ++i) {
        view[i] = buffer[i];
    }
    return ab;
}

global.helper.toBuffer = function (ab) {
    var buffer = new Buffer(ab.byteLength);
    var view = new Uint8Array(ab);
    for (var i = 0; i < buffer.length; ++i) {
        buffer[i] = view[i];
    }
    return buffer;
}

//iam not so sure about this functions.. :)
global.helper.toArrayBufferBin = function(buffer) {
    return new Uint8Array(buffer).buffer;
}

global.helper.toBufferBin = function (ab) {
    return new Buffer( new Uint8Array(ab) );
}

global.helper.ab2str = function(buf) {
    var stringArr = [];

    var piece  = 1000;
    var i = 0;
    while(i < buf.byteLength) {
        var rest = buf.byteLength - i;
        if(rest > piece) rest = piece;
        var slice = buf.slice(i, i + rest);
        var bufView = new Uint8Array(slice);
        var str = String.fromCharCode.apply(null, bufView);
        stringArr.push(str);

        i += piece;
    }

    return stringArr.join("");
}

global.helper.str2ab = function(str) {
    var buf = new ArrayBuffer(str.length);
    var bufView = new Uint8Array(buf);
    for (var i = 0; i < str.length; i++) {
        bufView[i] = str.charCodeAt(i);
    }
    return buf;
}


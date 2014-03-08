//crypto libs
require("../lib/crypto.js")

exports.PGP = function(test){
    var text = "text sdfasdfasd fasdfasdbgioasdfpibaWR" +
        "BAWEBNAE" +
        "DFGGASDFG" +
        "AFDG" +
        "ASDF" +
        "GASDRF" +
        "GSDF" +
        "G" +
        "SDF" +
        "G" +
        "SDF" +
        "";

    test.notEqual(openpgp, null);

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

    var publicKeys = openpgp.key.readArmored(publicKeyArmored);
    var privateKeys = openpgp.key.readArmored(privateKeyArmored);

    test.notEqual(publicKeys, null);
    test.notEqual(privateKeys, null);

    var signed = openpgp.signClearMessage(privateKeys.keys, text);

    console.log("OpenPGGSignedMessage", "\n" + signed);

    var clearText = openpgp.cleartext.readArmored(signed);
    var decrypted = openpgp.verifyClearSignedMessage(publicKeys.keys, clearText);

    test.equal(decrypted.signatures.length, 1);
    test.equal(decrypted.text, text);

    test.equal(decrypted.signatures[0].valid, true, "Verfiy Works");

    //test.equal(text, text2, "should be same");
    test.done();
};


exports.hash = function(test){

    var clear = "abc";
    var expected = "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad";

    var hash = openpgp.crypto.hash.sha256(clear);
    var hexHash = openpgp.util.hexstrdump(hash);

    test.equal(expected, hexHash, "same hash");

    test.done();
};

exports.AES = function(test){

    var clear = "foobarfoobar1234567890";

    var symmAlgo = "aes256"; // AES256
    var symmKey = openpgp.crypto.generateSessionKey(symmAlgo);
    var iv = openpgp.crypto.generateSessionKey(symmAlgo);
    var symmencDataOCFB = openpgp.crypto.cfb.normalEncrypt(symmAlgo, symmKey, clear, iv);

    var text = openpgp.crypto.cfb.normalDecrypt(symmAlgo,symmKey,symmencDataOCFB, iv);

    test.equal(clear, text);

    test.done();
};

exports.AESExchanged = function(test){

    var clear = "foobarfoobar1234567890";

    var genAlgo = "aes128"; // AES256

    var symmKey1 = openpgp.crypto.generateSessionKey(genAlgo);
    var symmKey2 = openpgp.crypto.generateSessionKey(genAlgo);

    var symmKey = symmKey1 + symmKey2;

    var symmAlgo = "aes256"; // AES256

    var iv = openpgp.crypto.generateSessionKey(symmAlgo);
    var symmencDataOCFB = openpgp.crypto.cfb.normalEncrypt(symmAlgo, symmKey, clear, iv);

    var text = openpgp.crypto.cfb.normalDecrypt(symmAlgo,symmKey,symmencDataOCFB, iv);

    test.equal(clear, text);

    test.done();
};

exports.AESExchangedSecured = function(test){

    var clear = "foobarfoobar1234567890";
    var genAlgo = "aes128"; // AES128

    //256 bit neeeded
    var symmKey1 = openpgp.crypto.generateSessionKey(genAlgo);
    var symmKey2 = openpgp.crypto.generateSessionKey(genAlgo);
    var symmKeyCombined = symmKey1 + symmKey2;
    var symmKey = openpgp.crypto.hash.sha256(symmKeyCombined);

    //128 bit needed
    var iv1 = openpgp.crypto.generateSessionKey(genAlgo);
    var iv2 = openpgp.crypto.generateSessionKey(genAlgo);
    var ivCombined = iv1 + iv2;
    var iv = openpgp.crypto.hash.sha256(ivCombined);

    var symmAlgo = "aes256"; // AES256
    var symmencDataOCFB = openpgp.crypto.cfb.normalEncrypt(symmAlgo, symmKey, clear, iv);

    var text = openpgp.crypto.cfb.normalDecrypt(symmAlgo,symmKey,symmencDataOCFB, iv);

    test.equal(clear, text);

    test.done();
};

exports.AESTest = function(test) {

    function encryptDecrypt(clear) {
        var genAlgo = "aes128"; // AES128

        //256 bit neeeded
        var symmKey1 = openpgp.crypto.generateSessionKey(genAlgo);
        var symmKey2 = openpgp.crypto.generateSessionKey(genAlgo);
        var symmKeyCombined = symmKey1 + symmKey2;
        var symmKey = openpgp.crypto.hash.sha256(symmKeyCombined);

        //128 bit needed
        var iv1 = openpgp.crypto.generateSessionKey(genAlgo);
        var iv2 = openpgp.crypto.generateSessionKey(genAlgo);
        var ivCombined = iv1 + iv2;
        var iv = openpgp.crypto.hash.sha256(ivCombined);

        var symmAlgo = "aes256"; // AES256
        var symmencDataOCFB = openpgp.crypto.cfb.normalEncrypt(symmAlgo, symmKey, clear, iv);

        var text = openpgp.crypto.cfb.normalDecrypt(symmAlgo,symmKey,symmencDataOCFB, iv);
        return text;
    }

    var text;
    var clear;

    clear = "foobarfoobar1234567890";
    clear = JSON.stringify(clear);
    text = encryptDecrypt(clear);
    test.equal(clear, text);

    clear = "1234567890abcdefghij1234567890abcdefghij1234567890abcdefghij";
    clear = JSON.stringify(clear);
    text = encryptDecrypt(clear);
    test.equal(clear, text);

    clear = "1234567890abcdefghij1234567890abcdefghij1234567890abcdefghij1234567890abcdefghij1234567890abcdefghij1234567890abcdefghij";
    clear = JSON.stringify(clear);
    text = encryptDecrypt(clear);
    test.equal(clear, text);

//here is the bug
    clear = "1234567890abcdefghij1234567890abcdefghij1234567890abcdefghij1234567890abcdefghij1234567890abcdefghij1234567890abcdefghij1234567890abcdefghij1234567890abcdefghij1234567890abcdefghij1234567890abcdefghij1234567890abcdefghij1234567890abcdefghij";
    clear = JSON.stringify(clear);
    text = encryptDecrypt(clear);
    test.equal(clear, text);

    //also here..
    clear = "1234567890abcdefghij1234567890abcdefghij1234567890abcdefghij1234567890abcdefghij1234567890abcdefghij1234567890abcdefghij1234567890abcdefghij1234567890abcdefghij1234567890abcdefghij1234567890abcdefghij1234567890abcdefghij1234567890abcdefghij1234567890abcdefghij1234567890abcdefghij1234567890abcdefghij1234567890abcdefghij1234567890abcdefghij1234567890abcdefghij1234567890abcdefghij1234567890abcdefghij1234567890abcdefghij1234567890abcdefghij1234567890abcdefghij1234567890abcdefghij";
    clear = JSON.stringify(clear);
    text = encryptDecrypt(clear);
    test.equal(clear, text);

    //but not here
    clear = "1234567890abcdefghij1234567890abcdefghij1234567890abcdefghij1234567890abcdefghij1234567890abcdefghij1234567890abcdefghij1234567890abcdefghij1234567890abcdefghij1234567890abcdefghij1234567890abcdefghij1234567890abcdefghij1234567890abcdefghij1234567890abcdefghij1234567890abcdefghij1234567890abcdefghij1234567890abcdefghij1234567890abcdefghij1234567890abcdefghij1234567890abcdefghij1234567890abcdefghij1234567890abcdefghij1234567890abcdefghij1234567890abcdefghij1234567890abcdefghijDer Benq GP20 ist ein 700 ANSI-Lumen heller LED-Projektor mit einem Gewicht von 1,5 kg, der eine Auflösung von 1.280 x 800 Pixeln sowie ein dynamisches Kontrastverhältnis von 100.000:1 erreichen soll.";
    text = encryptDecrypt(clear);

    test.equal(clear, text);

    test.done();

};

module("CryptoTestSymetric");

test("hash", function(){
    var clear = "abc";
    var expected = "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad";

    var hash = openpgp.crypto.hash.sha256(clear);
    var hexHash = openpgp.util.hexstrdump(hash);

    equal(expected, hexHash, "same hash");
});

//test if Encrypt and Decrypt works.
test("AesEncryptAndDecrypt", function(){
    var clear = "foobarfoobar1234567890";

    var symmAlgo = "aes256"; // AES256
    var symmKey = openpgp.crypto.generateSessionKey(symmAlgo);
    var iv = openpgp.crypto.generateSessionKey(symmAlgo);
    var symmencDataOCFB = openpgp.crypto.cfb.normalEncrypt(symmAlgo, symmKey, clear, iv);

    var text = openpgp.crypto.cfb.normalDecrypt(symmAlgo,symmKey,symmencDataOCFB, iv);

	equal(clear, text);
});

test("AESExchanged", function(){
    var clear = "foobarfoobar1234567890";

    var genAlgo = "aes128"; // AES128

    var symmKey1 = openpgp.crypto.generateSessionKey(genAlgo);
    var symmKey2 = openpgp.crypto.generateSessionKey(genAlgo);

    var symmKey = symmKey1 + symmKey2;

    var symmAlgo = "aes256"; // AES256

    var iv = openpgp.crypto.generateSessionKey(symmAlgo);
    var symmencDataOCFB = openpgp.crypto.cfb.normalEncrypt(symmAlgo, symmKey, clear, iv);

    var text = openpgp.crypto.cfb.normalDecrypt(symmAlgo,symmKey,symmencDataOCFB, iv);

    equal(clear, text);
});

test("AESExchangedSecured", function(){
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

    equal(clear, text);
});

test("AESExchangedSecuredLens", function(){

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
    equal(clear, text);

    clear = "1234567890abcdefghij1234567890abcdefghij1234567890abcdefghij";
    clear = JSON.stringify(clear);
    text = encryptDecrypt(clear);
    equal(clear, text);

    clear = "1234567890abcdefghij1234567890abcdefghij1234567890abcdefghij1234567890abcdefghij1234567890abcdefghij1234567890abcdefghij";
    clear = JSON.stringify(clear);
    text = encryptDecrypt(clear);
    equal(clear, text);

    //here is the bug
    clear = "1234567890abcdefghij1234567890abcdefghij1234567890abcdefghij1234567890abcdefghij1234567890abcdefghij1234567890abcdefghij1234567890abcdefghij1234567890abcdefghij1234567890abcdefghij1234567890abcdefghij1234567890abcdefghij1234567890abcdefghij";
    clear = JSON.stringify(clear);
    text = encryptDecrypt(clear);
    equal(clear, text);

    clear = "1234567890abcdefghij1234567890abcdefghij1234567890abcdefghij1234567890abcdefghij1234567890abcdefghij1234567890abcdefghij1234567890abcdefghij1234567890abcdefghij1234567890abcdefghij1234567890abcdefghij1234567890abcdefghij1234567890abcdefghij1234567890abcdefghij1234567890abcdefghij1234567890abcdefghij1234567890abcdefghij1234567890abcdefghij1234567890abcdefghij1234567890abcdefghij1234567890abcdefghij1234567890abcdefghij1234567890abcdefghij1234567890abcdefghij1234567890abcdefghij";
    clear = JSON.stringify(clear);
    text = encryptDecrypt(clear);
    equal(clear, text);

    clear = "1234567890abcdefghij1234567890abcdefghij1234567890abcdefghij1234567890abcdefghij1234567890abcdefghij1234567890abcdefghij1234567890abcdefghij1234567890abcdefghij1234567890abcdefghij1234567890abcdefghij1234567890abcdefghij1234567890abcdefghij1234567890abcdefghij1234567890abcdefghij1234567890abcdefghij1234567890abcdefghij1234567890abcdefghij1234567890abcdefghij1234567890abcdefghij1234567890abcdefghij1234567890abcdefghij1234567890abcdefghij1234567890abcdefghij1234567890abcdefghijDer Benq GP20 ist ein 700 ANSI-Lumen heller LED-Projektor mit einem Gewicht von 1,5 kg, der eine Auflösung von 1.280 x 800 Pixeln sowie ein dynamisches Kontrastverhältnis von 100.000:1 erreichen soll.";
    text = encryptDecrypt(clear);
    equal(clear, text);


});


module("CryptoTestAsymetric");

// /ideally we want to use these methods as they will be MUCH faster than doing everything in JS
//http://www.w3.org/TR/2012/WD-WebCryptoAPI-20120913/#aes-cbc
//however for now compatible APIs will suffice and openpgpjs is the best solution as middleware, let the lib handle this.


test( "testOpenPgpGenerateKey", function() {
    ok(openpgp != null);

    //no port here! the idea is to also create mail addresses, similar to our user accounts even if you don't have to
    //have these to use ravencrypt
    var userIdForPublicKeyServer = "user@server.country";

    //1 = RSA
    //512 bit is just for testing, generate 2048 bit in real world scenarios!
    var passphrase = null;
    var keyPair = openpgp.generateKeyPair(1, 512, userIdForPublicKeyServer, passphrase);

    callback(keyPair);
    function callback(keyPair) {
        //we don't need a password here, but it should be used in real world scenarios
        //var keyPair = openpgp.generate_key_pair(1, 512, "user", passphrase);


        var privateKey = keyPair['key'];
        var privateKeyArmored = keyPair['privateKeyArmored'];
        var publicKeyArmored = keyPair['publicKeyArmored'];

        console.log("OpenPGPprivateKeyArmored", "\n" + privateKeyArmored);
        console.log("OpenPGPpublicKeyArmored", "\n" + publicKeyArmored);

        ok(privateKey != null);
        ok(privateKeyArmored != null);
        ok(publicKeyArmored != null);

    }
});


//can't be tested in karma.. for now
//the worker never stops so it get killed, this is for reference only

//asyncTest( "testOpenPgpGenerateKeyAsync", function() {
//    ok(openpgp != null);
//
//    openpgp.initWorker("/base/src/crypto/openpgpjs/openpgp.worker.js");
//
//    //no port here! the idea is to also create mail addresses, similar to our user accounts even if you don't have to
//    //have these to use ravencrypt
//    var userIdForPublicKeyServer = "user@server.country";
//
//    //1 = RSA
//    //512 bit is just for testing, generate 2048 bit in real world scenarios!
//    var passphrase = null;
//
//
//    openpgp.generateKeyPair(1, 512, userIdForPublicKeyServer, passphrase, callback);
//
//    function callback(err, keyPair) {
//        //we don't need a password here, but it should be used in real world scenarios
//        //var keyPair = openpgp.generate_key_pair(1, 512, "user", passphrase);
//
//        ok(err == null);
//
//
//        var privateKey = keyPair['key'];
//        var privateKeyArmored = keyPair['privateKeyArmored'];
//        var publicKeyArmored = keyPair['publicKeyArmored'];
//
//        console.log("OpenPGPprivateKeyArmored", "\n" + privateKeyArmored);
//        console.log("OpenPGPpublicKeyArmored", "\n" + publicKeyArmored);
//
//        ok(privateKey != null);
//        ok(privateKeyArmored != null);
//        ok(publicKeyArmored != null);
//
//
//        var ap = openpgp.AsyncProxy;
//        var app = ap.prototype;
//        app.terminate();
//
//        start();
//
//    }
//
//});


test( "testOpenPgpEncryptDecrypt ", function(){
	var text = "text";

    ok(openpgp != null);

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

	ok(publicKeys != null);
	ok(privateKeys != null);

	var encrypted = openpgp.encryptMessage(publicKeys.keys, text);

	console.log("OpenPGPencryptedMessage", "\n" + encrypted);

	var msg = openpgp.message.readArmored(encrypted);

    //maybe do this if key is encrypted
    //privateKeys[0].decryptSecretMPIs();

    var decrypted = openpgp.decryptMessage(privateKeys.keys[0], msg);

    console.log("OpenPGPEncryptedDecrypted", "\n" + decrypted.text);

	equal(decrypted, text);
});

test("testOpenPGPEncryptedSignDecrypt", function(){
	var text = "text";

	ok(openpgp != null);

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

	ok(publicKeys != null);
	ok(privateKeys != null);

	var encrypted = openpgp.signAndEncryptMessage(publicKeys.keys, privateKeys.keys[0], text);

    console.log("OpenPGPencryptedMessage", "\n" + encrypted);

    var msg = openpgp.message.readArmored(encrypted);

    //maybe do this if key is encrypted
    //privateKeys[0].decryptSecretMPIs();

    var decrypted = openpgp.decryptAndVerifyMessage(privateKeys.keys[0], publicKeys.keys, msg);

    console.log("OpenPGPEncryptedSignedDecrypted", "\n" + decrypted.text);

	equal(decrypted.signatures.length, 1);
	equal(decrypted.text, text);

	equal(decrypted.signatures[0].valid, true, "Verfiy Works");
});


test("testOpenPGPSignVerify", function(){
    var text = "text";

    ok(openpgp != null);

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

    ok(publicKeys != null);
    ok(privateKeys != null);

    var signed = openpgp.signClearMessage(privateKeys.keys, text);

    console.log("OpenPGGSignedMessage", "\n" + signed);

    var clearText = openpgp.cleartext.readArmored(signed);
    var decrypted = openpgp.verifyClearSignedMessage(publicKeys.keys, clearText);

    equal(decrypted.signatures.length, 1);
    equal(decrypted.text, text);

    equal(decrypted.signatures[0].valid, true, "Verfiy Works");
});


test("testFreshOpenPgpEncryptDecrypt ", function(){
    var text = "text";


    ok(openpgp != null);

    //no port here! the idea is to also create mail addresses, similar to our user accounts even if you don't have to
    //have these to use ravencrypt
    var userIdForPublicKeyServer = "user@server.country";

    //1 = RSA
    //512 bit is just for testing, generate 2048 bit in real world scenarios!
    var passphrase = null;
    var keyPair = openpgp.generateKeyPair(1, 512, userIdForPublicKeyServer, passphrase);

    var privateKey = keyPair['key'];
    var privateKeyArmored = keyPair['privateKeyArmored'];
    var publicKeyArmored = keyPair['publicKeyArmored'];

    var publicKeys = openpgp.key.readArmored(publicKeyArmored);
    var privateKeys = openpgp.key.readArmored(privateKeyArmored);

    ok(publicKeys != null);
    ok(privateKeys != null);

    var encrypted = openpgp.encryptMessage(publicKeys.keys, text);

    console.log("OpenPGPencryptedMessage", "\n" + encrypted);

    var msg = openpgp.message.readArmored(encrypted);

    //new openpgpjs keys allways need to be decrypted, the old ones didn't.. oh well thats why we have unit tests. :-)
    privateKeys.keys[0].decrypt(null);

    var decrypted = openpgp.decryptMessage(privateKeys.keys[0], msg);

    console.log("OpenPGPEncryptedDecrypted", "\n" + decrypted.text);

    equal(decrypted, text);
});
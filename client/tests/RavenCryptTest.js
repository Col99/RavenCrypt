module("RavenCryptTest");

test("testAsymmetricKeySimple", function() {

    var openPGPKeyPair = RavenCryptAsymmetricKeyPair.createRSAKeyPair("test", 512);
    var rcKeyPair = RavenCryptAsymmetricKeyPair.createNew(openPGPKeyPair);

    var text = "hello";
    var encrypted = rcKeyPair.publicKey.encrypt(text);
    var decrypted = rcKeyPair.privateKey.decrypt(encrypted);

	equal(text, decrypted);
});

test("testAsymmetricKeyAdvanced", function() {

    var openPGPKeyPair = RavenCryptAsymmetricKeyPair.createRSAKeyPair("test", 512);
    var rcKeyPair = RavenCryptAsymmetricKeyPair.createNew(openPGPKeyPair);

    var text = "hello";
    var encrypted = rcKeyPair.publicKey.signAndEncrypt(text, rcKeyPair.privateKey.parsedPrivateKeys);
    var decrypted = rcKeyPair.privateKey.decryptAndVerify(encrypted, rcKeyPair.publicKey.parsedPublicKeys);

    equal(text, decrypted);
});

test("testSymmetricKey", function() {

    var symmAlgo = "aes256"; // AES256

    var key = openpgp.crypto.generateSessionKey(symmAlgo);
    var iv = openpgp.crypto.getPrefixRandom(symmAlgo);

    var messageKey = new RavenCryptSymmetricKey("0", key, iv);

    var text = "hello";
    var encrypted = messageKey.encrypt(text);
    var decrypted = messageKey.decrypt(encrypted);

    equal(text, decrypted);
});

test("testComKey", function() {

    var rcComKeyOne = RavenCryptComKey.createNew(1);
    var rcComKeyTwo = RavenCryptComKey.createNew(2);

    var messageKey = rcComKeyOne.combine(rcComKeyTwo);

    var text = "hello";
    var encrypted = messageKey.encrypt(text);
    var decrypted = messageKey.decrypt(encrypted);

    equal(text, decrypted);
});

test("testComKeyCompressionParse", function() {

    var rcComKeyOne = RavenCryptComKey.createNew(1);
    var rcComKeyTwo = RavenCryptComKey.createNew(2);


    var compressedOne = rcComKeyOne.compress();
    var compressedTwo = rcComKeyTwo.compress();

    rcComKeyOne = null;
    rcComKeyTwo = null;

    rcComKeyOne = RavenCryptComKey.decompress(compressedOne);
    rcComKeyTwo = RavenCryptComKey.decompress(compressedTwo);


    var messageKey = rcComKeyOne.combine(rcComKeyTwo);

    var text = "hello";
    var encrypted = messageKey.encrypt(text);
    var decrypted = messageKey.decrypt(encrypted);

    equal(text, decrypted);
});

test("testMessage", function() {
    var rcComKeyOne = RavenCryptComKey.createNew(1);
    var rcComKeyTwo = RavenCryptComKey.createNew(2);

    var rcMessageSender = new RavenCryptMessage(rcComKeyOne, rcComKeyTwo);

    var text = "Der Benq GP20 ist ein 700 ANSI-Lumen heller LED-Projektor mit einem Gewicht von 1,5 kg, der eine Auflösung von 1.280 x 800 Pixeln sowie ein dynamisches Kontrastverhältnis von 100.000:1 erreichen soll.";
    var encryptedMessage = rcMessageSender.encrypt(text);

    var testJson = JSON.stringify(encryptedMessage);

    //..there and back again..

    var testRebuild = JSON.parse(testJson);

    var rcMessageReceiver = new RavenCryptMessage(rcComKeyTwo, rcComKeyOne);
    var decrypted = rcMessageReceiver.decrypt(testRebuild.message, testRebuild.messageKey);

    equal(text, decrypted);
});

test("testCompressEncrypt", function() {

    var keyLengthInBits = 256;

    var messageKey = RavenCryptSymmetricKey.createNew("0");

    var text = "✓ à la modemodemodemodemodemode";

    var compressed = RavenCrypt.compress(text, RavenCrypt.defaultCompressionAlgorithm);
    var encrypted = messageKey.encrypt(compressed);
    var decrypted = messageKey.decrypt(encrypted);
    var decompressed = RavenCrypt.decompress(decrypted);

    equal(text, decompressed, "compressed equals decompressed");
});

test("testEverything", function() {

    var openPGPKeyPair = RavenCryptAsymmetricKeyPair.createRSAKeyPair("test", 512);
    var rcKeyPair = RavenCryptAsymmetricKeyPair.createNew(openPGPKeyPair);


    var rcComKeyOne = RavenCryptComKey.createNew(1);
    var rcComKeyTwo = RavenCryptComKey.createNew(2);

    var rcMessageSender = new RavenCryptMessage(rcComKeyOne, rcComKeyTwo);

    var text = "Der Benq GP20 ist ein 700 ANSI-Lumen heller LED-Projektor mit einem Gewicht von 1,5 kg, der eine Auflösung von 1.280 x 800 Pixeln sowie ein dynamisches Kontrastverhältnis von 100.000:1 erreichen soll.";
    var encryptedMessage = rcMessageSender.encrypt(text);

    var testJson = JSON.stringify(encryptedMessage);

    var encrypted = rcKeyPair.publicKey.signAndEncrypt(testJson, rcKeyPair.privateKey.parsedPrivateKeys);

    //..there and back again..

    var decrypted = rcKeyPair.privateKey.decryptAndVerify(encrypted, rcKeyPair.publicKey.parsedPublicKeys);

    var testRebuild = JSON.parse(decrypted);

    var rcMessageReceiver = new RavenCryptMessage(rcComKeyTwo, rcComKeyOne);
    var decrypted = rcMessageReceiver.decrypt(testRebuild.message, testRebuild.messageKey);

    ok(text, decrypted);
});

test("testBufferByRef", function() {

    function changeArray(buffer){
        buffer[0] = 1;
        buffer[1] = 2;
        buffer[2] = 3;
    }

    var buf = new Uint32Array(3);
    changeArray(buf);

    var one = buf[0];
    var two = buf[1];
    var three = buf[2];

    equal(buf.length, 3);
    equal(one, 1);
    equal(two, 2);
    equal(three, 3);

});

var fs = require('fs');

var TLSOptions;

//var tls = require('tls');
//var ciphers = tls.getCiphers();
//console.log(ciphers); // ['AES128-SHA', 'AES256-SHA', ...]

//here is most of the documentation on this
//http://nodejs.org/api/tls.html#tls_tls_createserver_options_secureconnectionlistener

//not to self: none of this seems to work right in windows.
//i couldn't get any of the good cyphers get running on a windows machine (i got ecdhe once in chrome but it doesn't work anymore lol).
//seems like only the newer node versions (0.11 and up support it, so we need to wait for them to get stable: https://github.com/joyent/node/issues/4315)


//don't allow RC4 anymore. RC4 is broken and should die :-)
//all modern browsers should support these modes, if yours don't = update your browser or set up your own server and use
//the cipher chain you still deem worthy :-)



//SelfSigned / CA
//generate CA key - you can either use this certificate as self signed cert or spawn a cert req as described below
//openssl genrsa -out ca-key.pem 2048
//openssl req -new -x509 -days 365 -key ca-key.pem -out ca-cert.pem

//Cert Req
//generate RSA Key and -> CSR <- (certificate sign request)
//openssl genrsa -out rsa-key.pem 2048
//openssl req -new -key rsa-key.pem -out rsa-csr.pem

//Sign Cert Req
//sign -> csr <- with the !ca key! to get our cert. normally your ssl vendor does this, but go ahead, if you know what your doing :-)
//openssl x509 -req -days 365 -in rsa-csr.pem -CA ca-cert.pem -CAkey ca-key.pem -set_serial 01 -out rsa-cert.pem


if (global.config.web.TLSMode == "RSA") {
    TLSOptions = {
        key: fs.readFileSync("config/keys/ca-key.pem"),
        cert: fs.readFileSync("config/keys/ca-cert.pem"),
        ciphers: '' +
            'ecdhe-rsa-aes256-gcm-sha256'.toUpperCase() + ':' +
            'ecdh-rsa-aes256-gcm-sha256'.toUpperCase() + ':' +
            'dhe-rsa-aes256-gcm-sha256'.toUpperCase() + ':' +
            'HIGH: +' +
            '!MD5:!aNULL:!EDH',
        honorCipherOrder: true
    };
}

//Alternative: generate Ecliptic Curve Key and Cert (better, less cpu consuming, but maybe a bit slower than rsa (you wont notice it ;)))
//however there are concerns about this since the NSA recommends it and "all the math" isn't done on this :)
//wikipedia lists some documentation on the SECP curves: http://en.wikipedia.org/wiki/SECG

//Info: secp512r1 would be something like RSA with 15360 bits.. but it has just 521 bits
//if we need less security / more speed we could use one of the other modes:
//secp192k1 = RSA 1536
//secp224k1 = RSA 2048
//secp256k1 = RSA 3072
//secp384k1 = RSA 7680
//secp521k1 = RSA 15360

//sect571k1 seems to be good.. the sect571r1 (r = "random") curves are suspicious of being NSA manipulated, so its recommended to use the K curves
//Bitcoin uses 256k btw:
//https://en.bitcoin.it/wiki/Secp256k1

//the node support for anything ec related is currently buggy at best btw, stick to RSA for now.

//generate private key
//openssl ecparam -out ec-key.pem -name sect571k1 -genkey

//generate certficate from private key
//openssl req -new -key ec-key.pem -x509 -nodes -days 365 -out ec-cert.pem


if (global.config.web.TLSMode == "EC") {
    TLSOptions = {
        key: fs.readFileSync("config/keys/ec-key.pem"),
        cert: fs.readFileSync("config/keys/ec-cert.pem"),
        ciphers: '' +
            'ecdhe-ecdsa-aes256-gcm-sha256'.toUpperCase() + ':' +
            'ecdh-ecdsa-aes256-gcm-sha256'.toUpperCase() + ':' +
            'dhe-ecdsa-aes256-gcm-sha256'.toUpperCase() + ':' +
            'HIGH:!' +
            'MD5:!aNULL:!EDH',
        honorCipherOrder: true
    };
}


//general note on this:
//if you use a CA to verify your certificate, they mustn't use the same algorithm as your certificate. they can sign your EC certificate
//with an RSA certificate and same the other way around. Probably a useful information if you are concerned about it. :-))


module.exports = TLSOptions;

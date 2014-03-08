var tooBusy = require('./../node_modules/node-toobusy-js/index.js');
var io = require('socket.io').listen(global.server);
var config = global.config;
var constants = global.constants;
var session = global.session;
var logger = global.logger;

global.io = io;

//don't set this to true. let just log what we need, by handling the events.
io.settings.log = false;
//default SOCKET.IO options..  (i hope)
//io.enable('browser client minification'); // send minified client
//io.enable('browser client etag'); // apply etag caching logic based on version number
//io.enable('browser client gzip'); // gzip the file
//io.set('log level', 1); // reduce logging
//io.set('transports', [ // enable all transports (optional if you want flashsocket)
//    'websocket'
//    , 'flashsocket'
//    , 'htmlfile'
//    , 'xhr-polling'
//    , 'jsonp-polling'
//]);


/**
 * Authorization and tooBusy.
 */
io.configure(function (){
    io.set('authorization', function (handshakeData, callback) {

        //Reject Sockets if our Server can't handle the load..
        if(tooBusy()){
            return callback(constants.serverIsBusy);
        }

        //TODO: remove before release
        if(config.isTestEnvironment()) {
            //lol these are ALLWAYS strings. keep that in mind!
            if (handshakeData.query.tinychat == "true" &&
                handshakeData.query.chattiny == "true") {

                handshakeData.tinyName = handshakeData.query.tinyName;
                return callback(null, true);
            }
        }

        var sessionObj = {
            sessionKeyID: parseInt(handshakeData.query.sessionKeyID),
            encrypted: handshakeData.query.encrypted
        };

        try {
            handshakeData.session = session.authenticate(sessionObj);
        } catch (err) {
            logger.trace("SocketAuthenticateError: (" + handshakeData.address.address + ") " + JSON.stringify(err));
            return callback("AUTHENTICATION_ERROR", false);
        }

        return callback(null, true);
    });
});


/**
 * Clustering
 */
if(config.clusterStore == global.clusterStores.clusterhub) {
    var store = new (require('socket.io-clusterhub'));
    io.configure(function() {
        io.set('store', store);
    });

} else if(global.config.clusterStore == global.clusterStores.redis) {
    var port = 6379, ip = "127.0.0.1", password = "";

    var RedisStore = require('socket.io/lib/stores/redis')
        , redis  = require('socket.io/node_modules/redis')
        , pub    = redis.createClient(port, ip)
        , sub    = redis.createClient(port, ip)
        , client = redis.createClient(port, ip);

    //TODO save redis options somewhere (config file? -> not in global.config because its "public")
//    pub.auth(password, function (err) { if (err) throw err; });
//    sub.auth(password, function (err) { if (err) throw err; });
//    client.auth(password, function (err) { if (err) throw err; });

    io.set('store', new RedisStore({
        redis    : redis
        , redisPub : pub
        , redisSub : sub
        , redisClient : client
    }));

}


//tiny chat, only available in test mode, to check if sockets work.
require("./io/ioTinyChat.js");

var ioRoutes = {};

io.sockets.on('connection', function (socket) {
    logger.info("NewSocketConnection: " + socket.handshake.address.address);

    if(!socket.handshake.tinyName) {
        socket.join('user/' + socket.handshake.session.user);
    }
});

module.exports = ioRoutes;


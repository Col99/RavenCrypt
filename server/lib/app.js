var toobusy = require('./../node_modules/node-toobusy-js/index.js');

//external libraries
var express = require('express');
var fs = require('fs');
var getRawBody = require('raw-body');
var logger = global.logger;
var constants = global.constants;
var config = global.config;

//setup express as our router
global.app = express();

//gzip compress the whole traffic.. threshold 1 is an extremely pessimistic setting here
//if we could activate this option for each individual route depending on its contents it would be best
//for now its better than no compression, even if it costs us a little cpu time, adjust this IF it becomes a problem
app.use(express.compress({threshold: 1}));

//only in production environment, because in tests(due to startup an other stuff) and development(debugger!) environments it doesn't matter if the server is overloaded
if (config.environment == 'production') {
    // The absolute first piece of middle-ware we would register, to block requests
    // before we spend any time on them.
    app.use(function(req, res, next) {
        // check if we're toobusy() - note, this call is extremely fast, and returns
        // state that is cached at a fixed interval
        if (toobusy()) res.send(503, "busy");
        else next();
    });
}

//https://developer.mozilla.org/en-US/docs/HTTP/Access_control_CORS
//accept ajax request from all sites
app.use(function(req, res, next) {
    //Allow CrossDomain Requests, needed for the whole thing to work!
    res.header("Access-Control-Allow-Origin", "*");
    //Allow all rest Methods, not just get!
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    //The headers the client is allowed to send to us!
    res.header("Access-Control-Allow-Headers", "Content-Type, Session, Content-Length");
    //The headers we are allowed to send to the client!
    res.header("Access-Control-Expose-Headers", "Content-Type, X-Signature, X-SignKeyID, X-Encryption");
    next();
});


/**
 * @description little factory to build requests handlers
 * @param options
 * @returns {*}
 */
var rcReqHandler = function reqHandler(options){
    //normal request
    var limit = "15kb";
    var encoding = "utf8";
    var json = true;
    var auth = false;
    var fnName = rcReqHandler.name;
    var passThrough = false;

    if(options.limit !== undefined) {
        limit = options.limit;
    }
    if(options.encoding !== undefined){
        encoding = options.encoding;
    }
    if(options.json !== undefined){
        json = options.json;
    }
    if(options.auth !== undefined){
        auth = options.auth;
    }
    if(options.passThrough !== undefined){
        passThrough = options.passThrough;
    }

    var reqHandler;

    function authhenticate(req, next, cb) {
        if(auth) {
            var sessionHeaderJson = req.headers['session'];
            if(sessionHeaderJson){
                try{
                    var sessionHeader = JSON.parse(sessionHeaderJson);
                    req.session = global.session.authenticate(sessionHeader);
                } catch(err){
                    logger.rcInvalid({
                        source: fnName,
                        ip: req.ip,
                        exception: err
                    });
                    return next(err);
                }
            } else {
                logger.rcInvalid({
                    source: fnName,
                    ip: req.ip,
                    exception: constants.reqHasNoSession
                });
                return next(constants.reqHasNoSession);
            }
        }
        cb();
    }

    if(passThrough){
        reqHandler = function (req, res, next){
            authhenticate(req, next, function(){
                next();
            });
        }
    } else {
      //Normal or Request handling
        reqHandler = function (req, res, next) {
            authhenticate(req, next, function(){

                //raw
                getRawBody(req, {
                    length: req.headers['content-length'],
                    limit: limit,
                    encoding: encoding
                }, function (err, string) {
                    if (err) {
                        return next(err);
                    }

                    if(json){
                        try{
                            req.body = JSON.parse(string);
                        } catch(err) {
                            logger.rcInvalid({
                                source: fnName,
                                ip: req.ip,
                                data: string,
                                exception: err
                            });
                            return next(constants.reqIsNotJson);
                        }
                    } else {
                        req.body = string;
                    }
                    next();
                });
            });
        };
    }


    return reqHandler;
};

global.rcReqHandler = rcReqHandler;

//the router needs to be added last in the chain, but before the routes are added
app.use(app.router);

//this if for other servers and auditors.. we do want to know what you configured, since nobody trusts you! :)
app.get('/config', function(req, res){
    return res.json(config);
});

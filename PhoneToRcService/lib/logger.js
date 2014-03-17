var log4js = require('log4js');
var config = global.config;

var logger = log4js.getLogger('server');

//docu:
//https://github.com/nomiddlename/log4js-node

//more detailed, but not node specific:
//http://log4js.berlios.de/docu/users-guide.html

//levels:
//Log4js    Log Levels Log4js.Level	Description
//OFF	    nothing is logged
//FATAL	    fatal errors are logged
//ERROR	    errors are logged
//WARN	    warnings are logged
//INFO	    infos are logged
//DEBUG	    debug infos are logged
//TRACE	    traces are logged

//this is no level in the nodejs version:
//ALL	    everything is logged

if (config.log.file){
    log4js.loadAppender('file');
    log4js.addAppender(log4js.appenders.file(config.logPath + 'server.log'), 'server');
}

//i don't like getting my info level spammed with console.log() by other modules.
//there is a particular annoying console.log in the spdy module that causes the log to get spammed with this:
//"[secureConnection] error" if you run a real server and play with tsl or just keep "refresh"(f5) pressed.

//my initial idea was just to activate this and elevate the log level above it, but this sets it to info,
//and to have that spam on info sucks.
//log4js.replaceConsole();

//thats why we do it this way and log the spam to trace:
console.log = function(text) {
    logger.trace(text);
}

//do cluster logging differently (!config.log.enabled || global.cluster.isWorker)
if (!config.log.enabled) {

    global.logger.setLevel(log4js.levels.OFF);
}

var getUTCTime = function(){
    var now = new Date();
    return new Date(now.getTime() + now.getTimezoneOffset() * 60 * 1000);
};


function getCSVText(data){
    var text = "";

    text += getUTCTime();
    text += ";";

    if(data.source){
        text += data.source ;
    }
    text += ";";

    if(data.type){
        text += data.type;
    }
    text += ";";

    if(data.ip){
        text += data.ip;
    }

    text += ";";
    if(data.user){
        text += JSON.stringify(data.user);
    }

    text += ";";
    if(data.data){
        text += JSON.stringify(data.data);
    }

    text += ";";
    if(data.exception){
        text += JSON.stringify(data.exception);
    }


    return text;
}

//rc methods should go in a separate file later, this is actually important network traffic
function logCSV(data){
    var text = getCSVText(data);

    //TODO doFileLogWithCluster..
    //SEE: datahttps://github.com/nomiddlename/log4js-node/wiki/Multiprocess
}

logger.rcSuccess = function(data){
    data.type = "Success";
    logCSV(data);
    logger.trace(JSON.stringify(data));
};

logger.rcIncoming = function(data){
    data.type = "Incoming";
    logCSV(data);
    logger.trace(JSON.stringify(data));
};

logger.rcInvalid = function(data){
    data.type = "Invalid";
    logCSV(data);
    logger.trace(JSON.stringify(data));
};

logger.rcError = function(data){
    data.type = "Error";
    logCSV(data);
    logger.error(JSON.stringify(data));
};


global.logger = logger;
var os = require('os');
var path = require('path');


var environmentModes = {
    test: 'test',
    development: 'development',
    productionTEST: 'productionTEST',
    production: 'production'
};
var clusterStores = {
    clusterhub: "clusterhub",
    redis: "redis"
}

exports.clusterStores = clusterStores;
exports.environmentModes = environmentModes;

//TODO: write self validation method for config
var config = function(overrideEnviron){

    //gets filled from package.json
    this.version = null;

    // Run Modes ('development', test', 'production') //set to 'production' for a real world server
    //this.environment = environmentModes.test;
    this.environment = environmentModes.development;
    //this.environment = environmentModes.production;
    //this.environment = environmentModes.productionTEST;

    //number of clustered processes to spawn. this should be
    //the number of CPUs you want to handle incoming connections.
    //if you have no database on the same server and nothing else
    //then this should be all the CPUs your operating system sees.
    //null = automatic detection
    this.numForks = null;

    //this indicates how the key/value store is set up.
    //if you run a single machine it is recommended to use clusterhub, so all process in nodejs can communicate directly to each other
    //if you run multiple machines or instances of the server you must use redis.
    this.clusterStore = clusterStores.clusterhub;


    //just out of pure interest, what kind of db people prefer.
    //gets auto filled from config.json, you don't need fill in anything here!
    this.dbType = null;
    //do not complain about never used. this is used ;)
    this.dbType = this.dbType;

    this.development = {};
    this.development.forceSyncModel = false; //works only in development mode

    this.web = {};
    this.log = {};

    //very important: this HAS to be a valid domain name with a valid certificate from a known CA, if you want to run a real server that is able to communicate with other RC servers
    this.web.hostname = "127.0.0.1";
    this.web.portHTTPS = 1338;

    if(this.web.portHTTPS != 443)
        this.web.serverName = this.web.hostname + ":" + this.web.portHTTPS;
    else
        this.web.serverName = this.web.hostname;

    this.web.TLSMode = "RSA"; // possible: EC/RSA; (EC = Elliptic Curve)

    this.log.enabled = true; //disabling this will turn of any logging.. including startup, file logging etc. useful for anonymous servers
    this.log.file = false;

    //Path for logs
    this.logPath = path.dirname(process.mainModule.filename) + "/logs/";

    //Path for Uploaded files.
    this.filePath = path.dirname(process.mainModule.filename) + "/files/";

    this.session = {};
    //Interval is in Days!
    this.session.KeyRenewInterval = 32;

    //validation config - do not change if you don't know what you are doing, this might result in an incompatible server to the rest of the "network"
    //database field lengths are also based on this
    this.validations = {};
    this.validations.user = {};
    this.validations.user.minLen = 3;
    this.validations.user.maxLen = 40;
    this.validations.user.regExpText = "^[a-z0-9_]{"+ this.validations.user.minLen +","+ this.validations.user.maxLen +"}$";
    this.validations.user.displayRegExpText = "^[a-zA-Z0-9_]{"+ this.validations.user.minLen +","+ this.validations.user.maxLen +"}$";

    this.validations.server = {};
    this.validations.server.maxLen = 260; // 253(domain)+1(:)+6(port) // xxx.xxx.xxx.xxx:123456 | my.domain.sux:123456 | ip06:suxx:fe80:fe80:fe80:fe80:123456

    this.validations.pubKeyID = {};
    this.validations.pubKeyID.length = 64;

    this.validations.hex256RegExpText = "^[0-9a-f]{64}$";
    this.validations.hex256Len = 64;

    //this regex should test for correct domain and port format
    //it might be too restrictive for subdomains, since its self cooked!
    //(?=[\da-z-\.]{3,253}(\:.{1,5})?$)^\+?([\da-z]{1}([\da-z]{1}([\da-z]{1}([\da-z-]{1,59}([\da-z]{1}))?)?)?\.)+([a-z]{2,6})(\:(6553[0-5]|655[0-2]\d|65[0-4]\d\d|6[0-4]\d{3}|[1-5]\d{4}|[1-9]\d{0,3}))?$
    this.validations.server.regExpText =
        "(?=[\\da-z-\\.]{3,253}(\\:.{1,5})?$)^\\+?([\\da-z]{1}([\\da-z]{1}([\\da-z]{1}([\\da-z-]{1,59}([\\da-z]{1}))?)?)?\\.)+([a-z]{2,6})(\\:(6553[0-5]|655[0-2]\\d|65[0-4]\\d\\d|6[0-4]\\d{3}|[1-5]\\d{4}|[1-9]\\d{0,3}))?$";

    //this data doesn't need to be exposed, but should be.
    //I would love to know what OS my communication server runs and if its updated or not
    //this MIGHT however cause a danger for people who NEVER update their system..
    this.os = {};
    this.os.type = os.type();
    this.os.platform = os.platform();
    this.os.arch = os.arch();
    this.os.release = os.release();

    if(overrideEnviron)
        this.environment = overrideEnviron;

    this.isTestEnvironment = function() {
        return (
            this.environment == environmentModes.test ||
            this.environment == environmentModes.development ||
            this.environment == environmentModes.productionTEST
        );
    };

    if (this.environment != environmentModes.development &&
        this.environment != environmentModes.productionTEST){
        //if not in development mode, delete the development namespace from config
        delete this.development;
    }

    if (this.environment == environmentModes.development ||
        this.environment == environmentModes.productionTEST){
        //disable server regex validations in these modes, so we can work with ips and garbage for system tests
        this.validations.server.regExpText = ".*";
    }

};

exports.config = config;
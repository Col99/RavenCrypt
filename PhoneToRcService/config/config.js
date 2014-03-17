var os = require('os');
var path = require('path');

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

    this.web = {};
    this.log = {};

   //very important: this HAS to be a valid domain name with a valid certificate from a known CA, if you want to run a real server that is able to communicate with other RC servers
    this.web.hostname = "127.0.0.1";
    this.web.portHTTPS = 1339;

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

};

exports.config = config;

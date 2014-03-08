//clustering..
global.cluster = require('cluster');

//lets load our config, hopefully nothing goes wrong here..
var configJs = require("./config/config.js");
global.environmentModes = configJs.environmentModes;
global.clusterStores = configJs.clusterStores;
global.config = new configJs.config();

//config for transport security.. contains server private key for server certificate, do not expose!
var TLSOptions = require("./config/TSLOptions.js");

//next lets set up our logger so we can see whats going on
require("./lib/logger.js")

//protocol libraries
//var http = require('http');
//var https = require('https'); //scratch that, SPDY here we come!
var spdy = require('spdy');

//internal objects
var pjson = require("./package.json");
config.version = pjson.version;

//crypto libs
require("./lib/crypto.js")

//small helper library, full of useful JS functions.
require("./lib/helper.js");

//message constants
require("./lib/constants.js");

//load the validation
require("./lib/validations.js");

//sessionKeys
require("./lib/session.js");
//-----------------------------------------------------
//------------------Server Startup---------------------
//-----------------------------------------------------

global.logger.info("RavenCrypt Server " + config.version + " Starting..");

//DB Setup
global.logger.info("Setting up Database Connection..");
global.db = require("./lib/db.js");

//Model Definition
global.logger.info("Defining Model.. ");
require("./lib/model.js");

//Express Setup
global.logger.info("Setting up Express..");
require("./lib/app.js");

//server
//var httpServer = http.createServer(global.app);
//var httpsServer = https.createServer(TLSOptions, global.app);
var spdyServer = spdy.createServer(TLSOptions, global.app);
global.server = spdyServer;

//SocketIo
global.logger.info("Adding Sockets..");
require("./lib/socket.js");

//Add the Routes
global.logger.info("Adding Routes..");
require("./lib/routes.js");

if (cluster.isMaster) {
    setUpMaster();

} else {
    //worker
    setUpWorker();
}

function getNumForks() {
    if (global.config.numForks)
        return global.config.numForks;

    //use half the number of CPUs present
    var numCPUs = require('os').cpus().length;
    var numThreads = parseInt(numCPUs / 2);
    //use at least one CPU, otherwise this makes no sense :)
    if (numThreads == 0) {
        numThreads = 1;
    }
    return numThreads;
}

function setUpMaster() {

    //in case one of our worker dies, we will just restart it. we are NEVER going down. awesome. fuck yeah! -> this is not a challenge
    //we are going down on overload, or if somebody finds a horrible fuckup, you don't need to prove this statement wrong ^^
    cluster.on('exit', function (worker, code, signal) {
        if (worker.suicide)
            return; //worker was killed for a reason, do not restart
        var exitCode = worker.process.exitCode;
        console.log('worker ' + worker.process.pid + ' died (' + exitCode + '). restarting...');
        cluster.fork();
    });

    //make sure, if the main process exits, we kill all workers
    process.on('exit', function () {
        function eachWorker(callback) {
            for (var id in cluster.workers) {
                callback(cluster.workers[id]);
            }
        }

        eachWorker(function (worker) {
            worker.kill();
        });

    });

    setUp(function (err) {
        if (err) {
            //something mus have went horribly wrong!
            process.exit();
        }

        global.logger.info("Triggering Master SessionKey generation, for server start..");
        global.session.updateKeys(function (err) {
            if (err) {
                global.logger.error(err);
                process.exit(-1);
            }

            //next step is either to fork our workers or start our master itself as a worker
            if (config.environment == environmentModes.development ||
                config.environment == environmentModes.test) {

                //if we are in these test environments the server will also start as a worker so we can debug it
                setUpWorker();

            } else {
                //we are in a production environment, lets start our workers!

                var numForks = getNumForks();

                // Fork workers.
                for (var i = 0; i < numForks; i++) {
                    global.logger.info("worker " + i + " forked")
                    cluster.fork();
                }
            }
        });
    });
}

function setUpWorker() {

    process.on('message', function (msg) {
        if (msg == "updateServerSessionKeys")
            global.logger.info("Master requested SessionKey update, syncing now!");
        global.session.updateKeys(function (err) {
            if (err)
                global.logger.error(err);
        });
    });


    global.logger.info("Triggering Worker SessionKey update, for server start..");
    global.session.updateKeys(function (err) {
        if (err) {
            global.logger.error(err);
            process.exit(-1);
        }
        finishSetup();
    });

    function finishSetup() {
        //enable logger after master initialization is done
        global.logger.setLevel(require('log4js').levels.TRACE);

        // Workers can share any TCP connection
        //means, multiple server instances listening on the same port, sharing the load. :-)
        startServer();
    }
}

function setUp(callback) {
    //DB Sync (will try to run migrations if not in dev mode!)
    //if successful the server will start
    if (config.environment == environmentModes.development ||
        config.environment == environmentModes.productionTEST) {
        global.logger.info("Trying to syncing underlying Database Schema with Object Model..");
        global.db.sequelize
            .sync({force: global.config.development.forceSyncModel})
            .error(function (err) {
                global.logger.log("Could not Sync Model: \n" + err);
                throw err;
            })
            .success(function () {
                startJobs();
            });
    } else {
        //if not in dev mode, we need to migrate our model with sequelize.
        //therefor syncing it would be useless. if we force sync we also loose
        //all the data here, and that shouldn't happen in test/production mode.
        startJobs();
    }

    function startJobs() {
        global.logger.info("Queuing and starting Jobs..!");
        global.masterJobs = require("./lib/masterJobs.js");
        callback(null);
    }
}

//and last but not least open ports for users to connect
function startServer() {

    global.workerJobs = require("./lib/workerJobs.js");

    try {
        var workerID = "";
        if (cluster.isWorker)
            workerID = cluster.worker.id + ": ";

        global.server.listen(config.web.portHTTPS);
        global.logger.info(workerID + "RavenCrypt Server Server listening on https://" + config.web.hostname + ":" + config.web.portHTTPS);

    } catch (err) {
        global.logger.info("Couldn't start Server:" + err)
        throw err;
    }
}

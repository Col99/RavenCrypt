var cronJob = require('cron').CronJob;
var jobs = {};

//Remember: Cron jobs run at defined day/week/month times!
//you don't write a cron job like "20 minutes after server start"
//you write one that deletes shit at 3 at night, when there is no traffic. :-)

//* * * * * command to be executed
//- - - - -
//| | | | |
//| | | | ----- Day of week (0 - 7) (Sunday=0 or 7)
//| | | ------- Month (1 - 12)
//| | --------- Day of month (1 - 31)
//| ----------- Hour (0 - 23)
//------------- Minute (0 - 59)

//0 3 * * * * = 3AM
//*/5 3 * * * * = every 5 minutes when its 3 AM.
//H 3 * * * * = also 3AM. :-)


jobs.weekly = new cronJob('00 30 11 * * 1-5', function(){
        // Runs every weekday (Monday through Friday)
        // at 11:30:00 AM. It does not run on Saturday
        // or Sunday.
    }, function () {
        // This function is executed when the job stops
    },
    false /* Start the job right now */  //... this doesn't mean it will run right now, just that it will run from now on!
    /* , timezone  Time zone of this job. */
);


jobs.register = new cronJob('*/30 * * * *', function(){
        // Runs every 30 Minutes
        var sixHoursAgo = new Date();
        sixHoursAgo.setHours(sixHoursAgo.getHours() - 6);

        //lt = less than, see documentation!
        global.model.UserRegister.destroy({createdAt: {lt: sixHoursAgo}})
            .success(function(){
                global.logger.trace("UserRegister cleared");
            })
            .error(function(err){
                global.logger.error("Could not clear UserRegister: " + err);
            });

    }, function () {
        // This function is executed when the job stops
    },
    true /* Start the job right now */ //... this doesn't mean it will run right now, just that it will run from now on!
    /* , timezone  Time zone of this job. */
);


jobs.masterCreateNewSessionKey = new cronJob('0 0 * * *', function(){
        //runs once a day

        var keyMaxAge = new Date() - global.config.session.KeyRenewInterval * 24 * 60 * 60 * 1000; /* ms */

        //if key is still healthy, we wont create a new one
        var activeSessionKey = global.session.skeys[global.session.skeyIDs[0]];
        if (activeSessionKey.createdAt > keyMaxAge)
            return;

        var cluster = global.cluster;

        global.session.newKey(function(err){
            if(err)
                global.logger.error(err);
            updateWorkers();
        });

        function updateWorkers(){
            function eachWorker(callback) {
                for (var id in cluster.workers) {
                    callback(cluster.workers[id]);
                }
            }
            eachWorker(function(worker) {
                worker.send("updateServerSessionKeys");
            });
        }


    }, function () {
        // This function is executed when the job stops
    },
    true /* Start the job right now */ //... this doesn't mean it will run right now, just that it will run from now on!
    /* , timezone  Time zone of this job. */
);

jobs.deleteOldMessagesAndCommunications = new cronJob('0 0 * * *', function(){
    //runs once a day

    var thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDay() - 30);

    //lt = less than, see documentation!
    global.model.Message
        .destroy({createdAt: {lt: thirtyDaysAgo}})
        .success(function(){
            global.logger.trace("UserRegister cleared");
        })
        .error(function(err){
            global.logger.error("Could not clear UserRegister: " + err);
        });

    global.model.Communication
        .destroy({createdAt: {lt: thirtyDaysAgo}})
        .success(function(){
            global.logger.trace("UserRegister cleared");
        })
        .error(function(err){
            global.logger.error("Could not clear UserRegister: " + err);
        });

    }, function () {
        // This function is executed when the job stops
    },
    true /* Start the job right now */ //... this doesn't mean it will run right now, just that it will run from now on!
    /* , timezone  Time zone of this job. */
);


//TODO:
//Create cronjob to delete logfiles older than 30 days.

module.exports = jobs;
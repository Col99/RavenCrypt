var Sequelize = require("sequelize");
var sequelize = null;

var dbConfigJSON = require("./../config/config.json");
var dbConfig = dbConfigJSON[global.config.environment];

if(!dbConfig){
    var msg = "Could not load database config fitting your environment!";
    global.logger.error(msg)
    throw new Error(msg)
}
if(!dbConfig.define) {
    var msg = "Your database config has no 'define' element!";
    global.logger.error(msg)
    throw new Error(msg)
}

//timestamps shouldn't be added by default in Sequelize in my opinion,
//but since you can stop it that's fine with me
//this should always be in the config.json file!
if(dbConfig.define.timestamps) {
    var msg = "Your database config has timestamps enabled, disable them this instant!\n"+
              "(If you had this enabled when you did your first migration, delete all tables!) \n" +
              "-> This option is not for you to play with, dough!";
    global.logger.error(msg)
    throw new Error(msg)
}

if (global.config.log.enabled)
    dbConfig.logging = function (text) { global.logger.trace(text); }
else
    dbConfig.logging = false;

//null = mysql
switch(dbConfig.dialect){
    case "sqlite":
        global.config.dbType = dbConfig.dialect;
        sequelize = new Sequelize(
            '',
            '',
            '',
            dbConfig
        );
    break;
    case "postgres":
        global.config.dbType = dbConfig.dialect;
    case "mysql":
    case null:
        global.config.dbType = "mysql";
        sequelize = new Sequelize(
            dbConfig.database,
            dbConfig.username,
            dbConfig.password,
            dbConfig
        );
    break;
}

exports.Sequelize = Sequelize;
exports.sequelize = sequelize;

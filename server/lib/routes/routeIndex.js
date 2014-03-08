var logger = global.logger;

const apiVersion = "1.0";

/**
 * @description Return AppName, ApiVersion and ServerVersion
 */
function index(req, res) {
    var ip = req.ip;
    var fnName = index.name;

    logger.rcIncoming({
        source: fnName,
        ip: ip
    });

    var appData = {
        appName: "RavenCrypt",
        serverVersion: config.version,
        apiVersion: apiVersion
    };

    logger.rcSuccess({
        source: fnName,
        ip: ip
    });

    return res.json(appData);
};
global.app.get('/', index);

module.exports.index = index;

logger.trace("Added Index");
var model = global.model;
var logger = global.logger;
var validations = global.validations;
var constants = global.constants;
var session = global.session;
var config = global.config;

/**
 * @description process incoming confirm msg
 */
function confirm(req, res) {
    var ip = req.ip;
    var data = req.body;
    var fnName = login.name;

    logger.rcIncoming({
        source: fnName,
        ip: ip,
        data: data
    });

    try {
        validations.confirm(data);
    } catch (err) {
        logger.rcInvalid({
            source: fnName,
            ip: ip,
            data: data,
            exception: err
        });
        return res.send(400, constants.syntaxIncorrect);
    }
};
global.app.post('/confirm', global.rcReqHandler({}), confirm);

logger.trace("processed Confirm");
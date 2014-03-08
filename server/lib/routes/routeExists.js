var model = global.model;
var logger = global.logger;
var validations = global.validations;
var constants = global.constants;

/**
 * @description Check if user Exists,
 * 0 = doesn't exists
 * 1 = exists
 * 2 = exists in register (is not a full user YET)
 */
function routeExists(req, res) {
    var ip = req.ip;
    var data = req.body;
    var fnName = routeExists.name;

    logger.rcIncoming({
        source: fnName,
        ip: ip,
        data: data
    });

    try {
        validations.routeExists(data);
    } catch (err) {
        logger.rcInvalid({
            source: fnName,
            ip: ip,
            data: data,
            exception: err
        });
        return res.send(400, constants.syntaxIncorrect);
    }

    var condition = {
        where: {
            name: data.user
        }
    };

    checkExitsUser();
    function checkExitsUser() {
        model.User
            .count(condition)
            .error(function (err) {
                logger.rcError({
                    source: fnName,
                    ip: ip,
                    data: data,
                    exception: err
                });
                return res.send(500, constants.systemException);
            })
            .success(function (count) {
                if (count > 0) {

                    logger.rcSuccess({
                        source: fnName,
                        ip: ip,
                        data: data
                    });
                    //user exists
                    return res.send(200, "1");
                }

                checkUserRegister();
            });
    }

    function checkUserRegister() {
        model.UserRegister
            .count(condition)
            .error(function (err) {
                logger.rcError({
                    source: fnName,
                    ip: ip,
                    data: data,
                    exception: err
                });
                return res.send(500, constants.systemException);
            })
            .success(function (count) {
                logger.rcSuccess({
                    source: fnName,
                    ip: ip,
                    data: data
                });

                if (count > 0) {
                    //user register exists
                    return res.send(200, "2");
                } else {

                    //user does not exist
                    return res.send(200, "0");
                }
            });
    }
};
global.app.post('/exists', global.rcReqHandler({}), routeExists);

module.exports.exists = routeExists;

logger.trace("Added Exists");
var captchapng = require('captchapng');
var model = global.model;
var logger = global.logger;
var validations = global.validations;
var constants = global.constants;
var config = global.config;

/**
 * @description route for new users to register
 */
function routeRegister(req, res) {
    var ip = req.ip;
    var data = req.body;
    var fnName = routeRegister.name;

    logger.rcIncoming({
        source: fnName,
        ip: ip,
        data: data
    });

    //validate data
    try {
        validations.routeRegister(data);
    } catch (err) {
        logger.rcInvalid({
            source: fnName,
            ip: ip,
            data: data,
            exception: err
        });
        return res.send(400, constants.syntaxIncorrect);
    }

    //the user in lower case is the actual format we expect,
    //however it can be formatted in camel case etc HERE, because
    //that's what will display on the blog later
    data.displayName = data.user;
    data.user = data.user.toLowerCase();

    var activationCode = parseInt(Math.random() * 8999 + 1000);

    //makes this fixed so we can run tests
    if (config.environment == "test") {
        activationCode = 1111;
    }

    var register = model.UserRegister
        .build({
            name: data.user,
            displayName: data.displayName,
            publicKey: data.publicKey,
            activationCode: activationCode,
            keyID: data.keyID
        });

    var err = register.validate();
    if(err) {
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

    checkUserExist();
    function checkUserExist() {
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
                if (count == 0) {
                    registerUser(data, activationCode);
                } else {
                    logger.rcInvalid({
                        source: fnName,
                        ip: ip,
                        data: data,
                        exception: constants.userExsits
                    });
                    return res.send(400, constants.userExsits);
                }
            });
    }

    function registerUser(data, activationCode) {
        model.UserRegister
            .findOrCreate({
                name: data.user
            }, {
                displayName: data.displayName,
                publicKey: data.publicKey,
                activationCode: activationCode,
                keyID: data.keyID
            })
            .error(function (err) {
                logger.rcError({
                    source: fnName,
                    ip: ip,
                    data: data,
                    exception: err
                });
                return res.send(500, constants.systemException);
            })
            .success(function (userRegister, created) {
                if (!created) {
                    if (userRegister.keyID != req.body.keyID) {
                        return res.json(400, constants.nameInUse);
                    }
                }

                var p = new captchapng(240, 90, userRegister.activationCode);
                p.color(0, 0, 0, 0);  // First color: background (red, green, blue, alpha)
                p.color(80, 80, 80, 255); // Second color: paint (red, green, blue, alpha)
                var img = p.getBase64();

                logger.rcSuccess({
                    source: fnName,
                    ip: ip,
                    data: data
                });
                return res.send(200, img);
            });
    }
};

/**
 * @description Confirm a registration
 */
function routeRegisterConfirm(req, res) {
    var ip = req.ip;
    var data = req.body;
    var fnName = routeRegisterConfirm.name;

    logger.rcIncoming({
        source: fnName,
        ip: ip,
        data: data
    });

    try {
        validations.routeRegisterConfirm(req.body);
    } catch (err) {
        logger.rcInvalid({
            source: fnName,
            ip: ip,
            data: data,
            exception: err
        });
        return res.send(400, constants.syntaxIncorrect);
    }

    try {
        var pgpMsg = model.UserRegister.read_message(data.activationCode);
    } catch (err) {
        logger.rcInvalid({
            source: fnName,
            ip: ip,
            data: data,
            exception: err
        });
        return res.send(400, constants.activationCodeIsNoPGPMsg);
    }

    var code = pgpMsg.text;

    model.UserRegister
        .find({
            where: {
                name: data.user,
                activationCode: code
            }
        })
        .error(function (err) {
            logger.rcError({
                source: fnName,
                ip: ip,
                data: data,
                exception: err
            });
            return res.send(500, constants.systemException);
        })
        .success(function (register) {
            if (register == null) {
                logger.rcInvalid({
                    source: fnName,
                    ip: ip,
                    data: data,
                    exception: constants.noRegistrationFound
                });
                return res.send(400, constants.noRegistrationFound);
            }

            try {
                var validSignature = register.check_message(pgpMsg);
            } catch (err) {
                register.destroy();

                logger.rcInvalid({
                    source: fnName,
                    ip: ip,
                    data: data,
                    exception: constants.msgCanNotBeValidated
                });
                return res.send(400, constants.msgCanNotBeValidated);
            }

            if (!validSignature) {
                register.destroy();

                logger.rcInvalid({
                    source: fnName,
                    ip: ip,
                    data: data,
                    exception: constants.noValidSignature
                });
                return res.send(400, constants.noValidSignature);
            }
            createUser(register);
        });

    function createUser(register) {
        model.User
            .create({
                name: register.name,
                displayName: register.displayName
            })
            .error(function (err) {
                logger.rcError({
                    source: fnName,
                    ip: ip,
                    data: data,
                    exception: err
                });
                return res.send(500, constants.systemException);
            })
            .success(function (user) {
                saveKey(register, user);
            });
    }

    function saveKey(register, user) {
        model.UserKey
            .create({
                name: register.name,
                keyID: register.keyID,
                key: register.publicKey,
                forLogin: true,
                forCom: true
            })
            .error(function (err) {
                user.destroy();

                logger.rcError({
                    source: fnName,
                    ip: ip,
                    data: data,
                    exception: err
                });
                return res.send(500, constants.systemException);
            })
            .success(function (key) {
                removeRegister(register, user, key);
            });
    }

    function removeRegister(register, user, key) {
        register.destroy()
            .error(function (err) {
                user.destroy();
                key.destroy();

                logger.rcError({
                    source: fnName,
                    ip: ip,
                    data: data,
                    exception: err
                });
                return res.send(500, constants.systemException);
            })
            .success(function () {
                logger.rcSuccess({
                    source: fnName,
                    ip: ip,
                    data: data
                });
                return res.send(200, "");
            });
    }
};

global.app.post('/register', global.rcReqHandler({}), routeRegister);
global.app.post('/register/confirm', global.rcReqHandler({}), routeRegisterConfirm);

module.exports.register = routeRegister;
module.exports.confirm = routeRegisterConfirm;

logger.trace("Added Register");
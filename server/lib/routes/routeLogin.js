var model = global.model;
var logger = global.logger;
var validations = global.validations;
var constants = global.constants;
var session = global.session;
var config = global.config;

/**
 * @description Login a user, returns an Encrypted PGPMsg containing a Session Key
 */
function login(req, res) {
    var ip = req.ip;
    var data = req.body;
    var fnName = login.name;

    logger.rcIncoming({
        source: fnName,
        ip: ip,
        data: data
    });

    try {
        validations.login(data);
    } catch (err) {
        logger.rcInvalid({
            source: fnName,
            ip: ip,
            data: data,
            exception: err
        });
        return res.send(400, constants.syntaxIncorrect);
    }

    getLogin();
    function getLogin() {
        model.UserLogin
            .findOrCreate({
                name: data.user,
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
            .success(function (userLogin, created) {
                if (!created && (userLogin.cached != null) && (userLogin.validUntil >= new Date())) {

                    logger.rcSuccess({
                        source: fnName,
                        ip: ip,
                        data: data
                    });
                    //our user already has a session and its cached, so lets send it to him
                    return res.json(200, userLogin.cached);
                } else {
                    createLogin(userLogin);
                }
            });
    }

    function createLogin(userLogin) {
        model.UserKey
            .findAll({
                where: {
                    name: data.user,
                    keyID: data.keyID
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
            .success(function (UserKeys) {

                if (UserKeys.length == 0) {
                    logger.rcInvalid({
                        source: fnName,
                        ip: ip,
                        data: data,
                        exception: constants.userOrKeyNotFound
                    });
                    return res.send(400, constants.userOrKeyNotFound);
                }
                var UserKey = UserKeys[0];

                if (!UserKey.forLogin) {
                    logger.rcInvalid({
                        source: fnName,
                        ip: ip,
                        data: data,
                        exception: constants.noLoginKey
                    });
                    return res.send(400, constants.noLoginKey);
                }

                //get the current session key from our stack
                var ServerSessionKey = session.skeys[session.skeyIDs[0]];
                userLogin.sessionKeyID = ServerSessionKey.id;

                //find out how long it should be valid
                var now = new Date();
                userLogin.validUntil = new Date(now.setDate(now.getDate() + config.session.KeyRenewInterval));

                //create a session for our user
                var sessionObj = {
                    user: data.user,
                    validUntil: userLogin.validUntil
                };

                var sessionJSON = JSON.stringify(sessionObj);

                //encrypt it wth our server session key
                var encryptedSession = ServerSessionKey.encrypt(sessionJSON);

                //turn our whole construct into a message for the user, also add what key we used so we will know what to
                //use to decrypt it later and tell the user when it won't be valid anymore
                var msg = {
                    validUntil: userLogin.validUntil,
                    sessionKeyID: userLogin.sessionKeyID,
                    encrypted: encryptedSession
                }

                //encrypt it with the users public key
                try {
                    var jsonMsg = JSON.stringify(msg);
                    var pgpMsg = UserKey.write_encrypted_message(jsonMsg);
                } catch (err) {
                    logger.rcError({
                        source: fnName,
                        ip: ip,
                        data: data,
                        exception: err
                    });
                    //the key should have been validated enough at this point that this never happens, but this is code, you never know.
                    return res.send(500, constants.systemException);
                }

                //cache the pgp result in the database
                userLogin.cached = pgpMsg;

                userLogin
                    .save()
                    .error(function (err) {
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
                        return res.json(200, pgpMsg);
                    });

            });
    }
};
global.app.post('/login', global.rcReqHandler({}), login);

module.exports.login = login;

logger.trace("Added Login");
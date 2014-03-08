var model = global.model;
var logger = global.logger;
var validations = global.validations;
var constants = global.constants;

/**
 * @description Get a specific key for a user
 */
function routeUserKeysGet(req, res) {
    var ip = req.ip;
    var data = req.body;
    var fnName = routeUserKeysGet.name;

    logger.rcIncoming({
        source: fnName,
        ip: ip,
        data: data
    });

    try {
        validations.routeUserKeysGet(data);
    } catch (err) {
        logger.rcInvalid({
            source: fnName,
            ip: ip,
            data: data,
            exception: err
        });
        return res.send(400, constants.syntaxIncorrect);
    }

    //never expose which is the login key, the user should know this himself
    var condition = {
        attributes: ['keyID', 'key', 'forCom'],
        where: {
            name: data.name,
            keyID: data.keyID,
            deleted: false
        }
    };

    model.UserKey
        .findAll(condition)
        .error(function (err) {
            logger.rcError({
                source: fnName,
                ip: ip,
                data: data,
                exception: err
            });
            return res.send(500, constants.systemException);
        })
        .success(function (keys) {
            if (keys.length == 1) {
                return res.json(200, keys[0].values);
            }

            logger.rcSuccess({
                source: fnName,
                ip: ip,
                data: data
            });
            return res.send(400, constants.userNotFound);
        });
};

/**
 * @description Get a list of Keys for a user
 */
function routeUserKeysList(req, res) {
    var ip = req.ip;
    var data = req.body;
    var fnName = routeUserKeysList.name;

    logger.rcIncoming({
        source: fnName,
        ip: ip,
        data: data
    });

    try {
        validations.routeUserKeysList(data);
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
        attributes: ['keyID', 'key', 'forCom'],
        where: {
            name: data.name,
            deleted: false
        }
    };

    model.UserKey
        .findAll(condition)
        .error(function (err) {
            logger.rcError({
                source: fnName,
                ip: ip,
                data: data,
                exception: err
            });
            return res.send(500, constants.systemException);
        })
        .success(function (keys) {
            if (keys.length == 1) {
                    var userKeys = [];
                    for (var i = 0; i < keys.length; i++) {

                        userKeys.push(keys[i].values);
                    }

                    logger.rcSuccess({
                        source: fnName,
                        ip: ip,
                        data: data
                    });
                return res.json(200, userKeys);
            }

            logger.rcInvalid({
                source: fnName,
                ip: ip,
                data: data,
                exception: constants.userNotFound
            });
            return res.send(400, constants.userNotFound);
        });
};

/**
 * @description adds a key to the users public key collection
 */
function routeUserKeysAdd(req, res) {
    var ip = req.ip;
    var data = req.body;
    var user = req.session.user;
    var fnName = routeUserKeysAdd.name;

    logger.rcIncoming({
        source: fnName.name,
        ip: ip,
        user: user,
        data: data
    });

    try {
        validations.routeUserKeysAdd(data);
    } catch (err) {
        logger.rcInvalid({
            source: fnName.name,
            ip: ip,
            user: user,
            data: data,
            exception: err
        });
        return res.send(400, constants.syntaxIncorrect);
    }

    model.UserKey
        .findOrCreate({
            name: name,
            keyID: data.keyID
        }, {
            forLogin: data.forLogin,
            key: data.key
        })
        .error(function (err) {
            logger.rcError({
                source: fnName.name,
                ip: ip,
                user: user,
                data: data,
                exception: err
            });
            return res.send(500, constants.systemException);
        })
        .success(function (key, created) {
            if(!created) {

                if(key.deleted) {
                    //keys shouldn't be reactivated
                    logger.rcSuccess({
                        source: fnName.name,
                        ip: ip,
                        user: user,
                        data: data
                    });
                    return res.send(200, false);
                } else {
                    logger.rcSuccess({
                        source: fnName.name,
                        ip: ip,
                        user: user,
                        data: data
                    });
                    return res.send(200, true);
                }

                //we could create a method to change login, com status here
                //..but not for now

//                key.deleted = false;
//
//                key
//                    .save()
//                    .error(function (err) {
//                        logger.rcError({
//                            source: fnName.name,
//                            ip: ip,
//                            user: user,
//                            data: data,
//                            exception: err
//                        });
//                        return res.send(500, constants.systemException);
//                    })
//                    .success(function (key) {
//                        logger.rcSuccess({
//                            source: fnName.name,
//                            ip: ip,
//                            user: user,
//                            data: data
//                        });
//                        return res.send(200, true);
//                    });
            } else {
                logger.rcSuccess({
                    source: fnName.name,
                    ip: ip,
                    user: user,
                    data: data
                });
                return res.send(200, true);
            }
        });
};

function routeUserKeysDelete(req, res) {
    var ip = req.ip;
    var data = req.body;
    var user = req.session.user;
    var fnName = routeUserKeysAdd.name;

    logger.rcIncoming({
        source: fnName.name,
        ip: ip,
        user: user,
        data: data
    });

    try {
        validations.routeUserKeysDelete(data);
    } catch (err) {
        logger.rcInvalid({
            source: fnName.name,
            ip: ip,
            user: user,
            data: data,
            exception: err
        });
        return res.send(400, constants.syntaxIncorrect);
    }

    var condition = {
        attributes: ['keyID', 'key', 'forCom', 'forLogin'],
        where: {
            name: data.name,
            deleted: false
        }
    };

    model.UserKey
        .findAll(condition)
        .error(function (err) {
            logger.rcError({
                source: fnName,
                ip: ip,
                data: data,
                user: user,
                exception: err
            });
            return res.send(500, constants.systemException);
        })
        .success(function (keys) {
            checkKeys(keys);
        });


    function checkKeys(keys){
        if(keys.length == 1){
            return res.json(200, false); //Can't delete last key. should be obvious,
                                         //delete it together with the user instead.
        }
        var remainingLoginKeys = 0;
        var remainingComKeys = 0;
        var keyToDelete=null;
        for(var i=0;i<keys.length;i++){
            var key = keys[i];
            if(key.keyID==req.body.keyID) {
                keyToDelete = key;
            } else {
                if(key.forLogin) {
                    remainingLoginKeys++;
                }
                if(key.forCom) {
                    remainingComKeys++;
                }
            }
        }
        if(keyToDelete){
            if(remainingLoginKeys == 0 || remainingComKeys == 0) {
                logger.rcSuccess({
                    source: fnName.name,
                    ip: ip,
                    user: user,
                    data: data
                });
                return res.send(200, false); // Can't delete last login or com key
            }
            keyToDelete.deleted = true;
            keyToDelete
                .save()
                .error(function(){
                    logger.rcError({
                        source: fnName.name,
                        ip: ip,
                        user: user,
                        data: data,
                        exception: err
                    });
                    return res.send(500, constants.systemException);
                })
                .success(function(){
                    logger.rcSuccess({
                        source: fnName.name,
                        ip: ip,
                        user: user,
                        data: data
                    });
                    return res.json(200, true);
                });
        } else {
            logger.rcSuccess({
                source: fnName.name,
                ip: ip,
                user: user,
                data: data
            });
            return res.send(200, false); // Can't delete last login or com key
        }
    }
};


global.app.post('/keys/add', global.rcReqHandler({auth: true}), routeUserKeysAdd);
global.app.post('/keys/get', global.rcReqHandler({}), routeUserKeysGet);
global.app.post('/keys/list', global.rcReqHandler({}), routeUserKeysList);
global.app.post('/keys/delete', global.rcReqHandler({}), routeUserKeysDelete);

//add is some type we can't use.
module.exports.addd = routeUserKeysAdd;
module.exports.get = routeUserKeysGet;
module.exports.list = routeUserKeysList;
module.exports.delte = routeUserKeysDelete;

logger.trace("Added UserKeys");


//global.app.delete('/keys/delete', global.routes.userkeys.delete);


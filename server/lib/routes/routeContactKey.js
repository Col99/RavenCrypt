var model = global.model;
var logger = global.logger;
var validations = global.validations;
var constants = global.constants;
var sockets = global.io.sockets;
var Sequelize = global.Sequelize;
var helper = global.helper;


/**
 * @description Inserts/Updates a Contact
 */
function routeContactKeyUpsert(req, res) {
    var ip = req.ip;
    var data = req.body;
    var user = req.session.user;
    var fnName = routeContactKeyUpsert.name;

    logger.rcIncoming({
        source: fnName,
        ip: ip,
        user: user,
        data: data
    });

    try {
        validations.routeContactKeyUpsert(data);
    } catch (err) {
        logger.rcInvalid({
            source: fnName,
            ip: ip,
            user: user,
            data: data,
            exception: err
        });
        return res.send(400, constants.syntaxIncorrect);
    }

    model.ContactKey
        .findOrCreate({
            user: user,
            name: data.name,
            server: data.server,
            keyID: data.keyID
        }, {
            key: data.key,
            verification: data.verification,
            verificationSignKeyID: data.verificationSignKeyID,
            forCom: data.forCom
        })
        .error(function (err) {
            logger.rcError({
                source: fnName,
                ip: ip,
                user: user,
                data: data,
                exception: err
            });
            return res.send(500, constants.systemException);
        })
        .success(function (contactKey, created) {
            if(!created) {
                contactKey.deleted = false;
                contactKey.forCom = data.forCom;
                contactKey.changedAt = helper.getUTCTime();

                contactKey
                    .save()
                    .error(function (err) {
                        logger.rcError({
                            source: fnName,
                            ip: ip,
                            user: user,
                            data: data,
                            exception: err
                        });
                    })
                    .success(function (contact) {
                        contactKeyUpserted(contact);
                    });
            } else {
                contactKeyUpserted(contactKey);
            }
        });

    function contactKeyUpserted(contactKey){
        //inform all clients about the new contact
        sockets
            .in('user/' + user)
            .emit('contactKey/upsert', {
                name: contactKey.name,
                server: contactKey.server,
                keyID: contactKey.keyID,
                key: contactKey.key,
                verification: contactKey.verification,
                verificationSignKeyID: contactKey.verificationSignKeyID,
                forCom: contactKey.forCom
            });

        logger.rcSuccess({
            source: fnName,
            ip: ip,
            user: user,
            data: data
        });
        return res.json(200, true);
    }
}

/**
 * @description Method that the client should call on connection, to get latest ContactKeys
 */
function routeContactKeyList(req, res) {
    var ip = req.ip;
    var data = req.body;
    var user = req.session.user;
    var fnName = routeContactKeyList.name;

    logger.rcIncoming({
        source: fnName.name,
        ip: ip,
        user: user,
        data: data
    });

    try {
        validations.routeContactKeyList(data);
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
        attributes: ['name', 'server', 'keyID', 'key', 'verification', 'verificationSignKeyID', 'forCom'],
        where: {
            user: user
        }
    };

    if(data.since) {
        condition.where.changedAt = {};
        condition.where.changedAt.gt = data.since;
    }

    model.ContactKey
        .findAll(condition)
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
        .success(function (contactKeys) {
            var conKeyValues = [];

            for(var i=0; i<contactKeys.length;i++) {
                conKeyValues.push(contactKeys[i].values);
            }

            logger.rcSuccess({
                source: fnName.name,
                ip: ip,
                user: user,
                data: data
            });
            return res.json(200, conKeyValues);
        });
}

/**
 * @description get specific contactKey from the server
 *              currently not needed!
 */
function routeContactKeyGet(req, res) {
    var ip = req.ip;
    var data = req.body;
    var user = req.session.user;
    var fnName = routeContactKeyGet.name;

    logger.rcIncoming({
        source: fnName.name,
        ip: ip,
        user: user,
        data: data
    });

    try {
        validations.routeContactKeyGet(data);
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
        attributes: ['name', 'server', 'keyID', 'key', 'verification', 'verificationSignKeyID', 'forCom'],
        where: {
            user: user,
            name: data.name,
            server: data.server,
            keyID: data.keyID
        }
    };

    model.ContactKey
        .find(condition)
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
        .success(function (contact){
            logger.rcSuccess({
                source: fnName.name,
                ip: ip,
                user: user,
                data: data
            });
            return res.json(200, contact.values);
        });
};

/**
 * @description delete a contact from the server
 */
function routeContactKeyDelete(req, res) {
    var ip = req.ip;
    var data = req.body;
    var user = req.user;
    var fnName = routeContactKeyDelete.name;

    logger.rcIncoming({
        source: fnName,
        ip: ip,
        user: user,
        data: data
    });

    try {
        validations.routeContactKeyDelete(data);
    } catch (err) {
        logger.rcInvalid({
            source: fnName,
            ip: ip,
            user: user,
            data: data,
            exception: err
        });
        return res.send(400, constants.syntaxIncorrect);
    }

    model.Contact
        .find({
            where: {
                user: user,
                name: data.name,
                server: data.server
            }
        })
        .error(function (err) {
            logger.rcError({
                source: fnName,
                ip: ip,
                user: user,
                data: data,
                exception: err
            });
            return res.send(500, constants.systemException);
        })
        .success(function (contactKey) {
            contactKey.deleted = true;

            contactKey
                .save()
                .error(function (err) {
                    logger.rcError({
                        source: fnName,
                        ip: ip,
                        user: user,
                        data: data,
                        exception: err
                    });
                })
                .success(function (contactKey) {
                    logger.rcSuccess({
                        source: fnName,
                        ip: ip,
                        user: user,
                        data: data
                    });
                    return res.json(200, true);
                });
        });
};

app.post('/contactKey/list', global.rcReqHandler({auth: true}), routeContactKeyList);
app.post('/contactKey/get', global.rcReqHandler({auth: true}), routeContactKeyGet);
app.post('/contactKey/upsert', global.rcReqHandler({auth: true}), routeContactKeyUpsert);
app.post('/contactKey/delete', global.rcReqHandler({auth: true}), routeContactKeyDelete);

module.exports.list = routeContactKeyList;
module.exports.get = routeContactKeyGet;
module.exports.upsert = routeContactKeyUpsert;
module.exports.delete = routeContactKeyDelete;


global.logger.trace("Added Contact");
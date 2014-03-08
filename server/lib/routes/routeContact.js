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
function routeContactUpsert(req, res) {
    var ip = req.ip;
    var data = req.body;
    var user = req.session.user;
    var fnName = routeContactUpsert.name;

    logger.rcIncoming({
        source: fnName,
        ip: ip,
        user: user,
        data: data
    });

    try {
        validations.routeContactUpsert(data);
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
        .findOrCreate({
            user: user,
            name: data.name,
            server: data.server

        }, {
            keepComAlive: data.keepComAlive
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
        .success(function (contact, created) {
            if(!created) {
                contact.deleted = false;
                contact.keepComAlive = data.keepComAlive;
                contact.changedAt = helper.getUTCTime();

                //only update the count one number forward.
                if(contact.comKeyCount + 1 == data.comKeyCount) {
                    contact.comKeyCount = data.comKeyCount
                }

                contact
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
                        contactUpserted(contact);
                    });
            } else {
                contactUpserted(contact);
            }
        });

    function contactUpserted(contact){
        //inform all clients about the new contact
        sockets
            .in('user/' + user)
            .emit('contact/upsert', {
                name: contact.name,
                server: contact.server,
                keepComAlive: contact.keepComAlive,
                comKeyCount: contact.comKeyCount
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
* @description Method that the client should call on connection, to get latest Contacts
*/
function routeContactList(req, res) {
    var ip = req.ip;
    var data = req.body;
    var user = req.session.user;
    var fnName = routeContactList.name;

    logger.rcIncoming({
        source: fnName.name,
        ip: ip,
        user: user,
        data: data
    });

    try {
        validations.routeContactList(data);
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
        attributes: ['name', 'server', 'keepComAlive', 'comKeyCount'],
        where: {
            user: user
        }
    };

    if(data.since) {
        condition.where.changedAt = {};
        condition.where.changedAt.gt = data.since;
    }

    model.Contact
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
        .success(function (contacts) {
            var conValues = [];

            for(var i=0; i<contacts.length;i++) {
                conValues.push(contacts[i].values);
            }

            logger.rcSuccess({
                source: fnName.name,
                ip: ip,
                user: user,
                data: data
            });
            return res.json(200, conValues);
        });
}

/**
* @description get specific contact from the server
 *             currently not needed!
*/
function routeContactGet(req, res) {
    var ip = req.ip;
    var data = req.body;
    var user = req.session.user;
    var fnName = routeContactGet.name;

    logger.rcIncoming({
        source: fnName.name,
        ip: ip,
        user: user,
        data: data
    });

    try {
        validations.routeContactGet(data);
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
        attributes: ['name', 'server', 'keepComAlive', 'comKeyCount'],
        where: {
            user: user,
            name: data.name,
            server: data.server
        }
    };

    model.Contact
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
function routeContactDelete(req, res) {
    var ip = req.ip;
    var data = req.body;
    var user = req.user;
    var fnName = routeContactDelete.name;

    logger.rcIncoming({
        source: fnName,
        ip: ip,
        user: user,
        data: data
    });

    try {
        validations.routeContactDelete(data);
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
        .success(function (contact) {
            contact.deleted = true;

            contact
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

app.post('/contact/list', global.rcReqHandler({auth: true}), routeContactList);
app.post('/contact/get', global.rcReqHandler({auth: true}), routeContactGet);
app.post('/contact/upsert', global.rcReqHandler({auth: true}), routeContactUpsert);
app.post('/contact/delete', global.rcReqHandler({auth: true}), routeContactDelete);

module.exports.list = routeContactList;
module.exports.get = routeContactGet;
module.exports.upsert = routeContactUpsert;
module.exports.delete = routeContactDelete;


global.logger.trace("Added Contact");
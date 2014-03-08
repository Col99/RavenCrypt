var config = global.config;
var model = global.model;
var logger = global.logger;
var validations = global.validations;
var constants = global.constants;
var sockets = global.io.sockets;
var Sequelize = global.Sequelize;

/**
 * @description Receive Communications for a User from Other
 */
function routeComReceive(req, res) {
    var ip = req.ip;
    var data = req.body;
    var fnName = routeComReceive.name;

    logger.rcIncoming({
        source: fnName,
        ip: ip,
        data: data
    });

    //Validate the Data
    try {
        validations.routeComReceive(data);
    } catch (err) {
        logger.rcInvalid({
            source: fnName,
            ip: ip,
            data: data,
            exception: err
        });
        return res.send(400, constants.syntaxIncorrect);
    }

    //Validate against model
    var communication = model.Communication
        .build({
            id: data.id,
            sender: data.sender,
            senderServer: data.senderServer,
            senderKeyID: data.senderKeyID,
            receiver: data.receiver,
            receiverServer: config.web.serverName,
            receiverKeyID: data.receiverKeyID,
            text: data.text
        });

    var err = communication.validate();
    if(err) {
        logger.rcInvalid({
            source: fnName,
            ip: ip,
            data: data,
            exception: err
        });
        return res.send(400, constants.syntaxIncorrect);
    }

    checkUserExist();
    function checkUserExist() {
        //Check if User exists
        var condition = {
            where: {
                name: data.receiver
            }
        };

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
                    logger.rcSuccess({
                        source: index.name,
                        ip: ip,
                        data: data
                    });
                    return res.json(200, false);
                }
                saveCom();
            });
    }

    function saveCom() {
        communication
            .save()
            .error(function(err){
                logger.rcError({
                    source: fnName,
                    ip: ip,
                    data: data,
                    exception: err
                });
                return res.send(500, constants.systemException);
            })
            .success(function(comKey){
                //inform all clients that saving worked/ new com key was send, just like a normal message
                sockets
                    .in('user/' + data.receiver)
                    .emit('com/receive', {
                        id: comKey.id,
                        sender: comKey.sender,
                        senderServer: comKey.senderServer,
                        senderKeyID: comKey.senderKeyID,
                        receiver: comKey.receiver,
                        receiverServer: comKey.receiverServer,
                        receiverKeyID: comKey.receiverKeyID,
                        text: comKey.text
                    });


                logger.rcSuccess({
                    source: fnName,
                    ip: ip,
                    data: data
                });
                return res.json(200, true);
            });
    }
};

/**
 * @description Save the message the user send on own server
 */
function routeComSave(req, res) {
    var ip = req.ip;
    var data = req.body;
    var user = req.session.user;
    var fnName = routeComSave.name;

    logger.rcIncoming({
        source: fnName.name,
        ip: ip,
        user: user,
        data: data
    });

    try {
        validations.routeComSave(data);
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

    var communication = model.Communication
        .build({
            id: data.id,
            sender: user,
            senderServer: config.web.serverName,
            senderKeyID: data.senderKeyID,
            receiver: data.receiver,
            receiverServer: data.receiverServer,
            receiverKeyID: data.receiverKeyID,
            text: data.text
        });

    var err = communication.validate();
    if(err) {
        logger.rcInvalid({
            source: fnName.name,
            ip: ip,
            user: user,
            data: data,
            exception: err
        });
        return res.send(400, constants.syntaxIncorrect);
    }

    if (communication.senderServer != communication.receiverServer){
        //we only need to do this if both use different same servers because otherwise the entry likely already exists
        communication
            .save()
            .error(function(err){
                logger.rcError({
                    source: fnName.name,
                    ip: ip,
                    user: user,
                    data: data,
                    exception: err
                });
                return res.send(500, constants.systemException);
            })
            .success(function(com){
                informUser(com);
            });
    } else {
        informUser(communication);
    }

    function informUser(com){
        //inform all clients that saving worked/ new com key was send, just like a normal message
        sockets
            .in('user/' + user)
            .emit('com/receive', {
                id: com.id,
                sender: com.sender,
                senderServer: com.senderServer,
                senderKeyID: com.senderKeyID,
                receiver: com.receiver,
                receiverServer: com.receiverServer,
                receiverKeyID: com.receiverKeyID,
                text: com.text
            });

        logger.rcSuccess({
            source: fnName.name,
            ip: ip,
            user: user,
            data: data
        });
        return res.json(200, true);
    }
};

/**
 * @description Method that the client should call on connection, to get latest Communications IDs
 */
function routeComList(req, res) {
    var ip = req.ip;
    var data = req.body;
    var user = req.session.user;
    var fnName = routeComList.name;

    logger.rcIncoming({
        source: fnName.name,
        ip: ip,
        user: user,
        data: data
    });

    try {
        validations.routeComList(data);
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

    var condIn = {
        receiver: user,
        receiverServer: config.web.serverName
    };
    var condOut = {
        sender: user,
        senderServer: config.web.serverName
    };
    if(data.since) {
        condIn.where.createAt = {};
        condIn.where.createAt.gt = data.since;
        condOut.where.createAt = {};
        condOut.where.createAt.gt = data.since;
    }

    var condition = {
        attributes: ['id', 'receiver', 'receiverServer', 'sender', 'senderServer'],
        where: Sequelize.or(condIn, condOut)
    };

    model.Communication
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
        .success(function (coms) {
            var ids = [];
            for(var i=0; i<coms.length;i++) {
                var com;

                if(coms[i].sender == user &&
                    coms[i].senderServer == config.web.serverName) {
                    com = [
                        "o",
                        coms[i].receiver,
                        coms[i].receiverServer
                    ];
                } else {
                    com = [
                        "i",
                        coms[i].sender,
                        coms[i].senderServer
                    ];
                }
                ids.push(com);
            }

            logger.rcSuccess({
                source: fnName.name,
                ip: ip,
                user: user,
                data: data
            });
            return res.json(200, ids);
        });
};

/**
 * @description get communication from server by id
 */
function routeComGet(req, res) {
    var ip = req.ip;
    var data = req.body;
    var user = req.session.user;
    var fnName = routeComSave.name;

    logger.rcIncoming({
        source: fnName.name,
        ip: ip,
        user: user,
        data: data
    });

    try {
        validations.routeComGet(data);
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
        attributes: ['id', 'sender', 'senderServer', 'receiverKeyID', 'senderKeyID', 'text']
    };

    if(data.direction == "i") {
        condition.where = {
            receiver: user,
            receiverServer: global.config.web.serverName,
            sender: data.name,
            senderServer: data.server,
            id: data.id
        }
    } else if (data.direction == "o") {
        condition.where = {
            receiver: data.name,
            receiverServer: data.server,
            sender: user,
            senderServer: global.config.web.serverName,
            id: data.id
        }
    } else {
        return res.send(400, constants.syntaxIncorrect);
    }

    model.Communication
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
        .success(function (com) {
            logger.rcSuccess({
                source: fnName.name,
                ip: ip,
                user: user,
                data: data
            });
            return res.json(200, com.values);
        });
};

global.app.post('/com/receive', global.rcReqHandler({}), routeComReceive);
global.app.post('/com/save', global.rcReqHandler({auth: true}), routeComSave);
global.app.post('/com/list', global.rcReqHandler({auth: true}), routeComList);
global.app.post('/com/get', global.rcReqHandler({auth: true}), routeComGet);

module.exports.receive = routeComReceive;
module.exports.save = routeComSave;
module.exports.list = routeComList;
module.exports.get = routeComGet;

logger.trace("Added Communication");
var config = global.config;
var model = global.model;
var logger = global.logger;
var validations = global.validations;
var constants = global.constants;
var sockets = global.io.sockets;
var Sequelize = global.Sequelize;

/**
 * @description Receive Messages for a User from Other
 */
function routeMsgReceive(req, res) {
    var ip = req.ip;
    var data = req.body;
    var fnName = routeMsgReceive.name;

    logger.rcIncoming({
        source: fnName,
        ip: ip,
        data: data
    });

    //Validate the Data
    try {
        validations.routeMsgReceive(data);
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
    var message = model.Message
        .build({
            id: data.id,
            sender: data.sender,
            senderServer: data.senderServer,
            senderKeyID: data.senderKeyID,
            receiver: data.receiver,
            receiverServer: config.web.serverName,
            receiverKeyID: data.receiverKeyID,
            text: data.text,
            key: data.key
        });

    var err = message.validate();
    if(err) {
        logger.rcInvalid({
            source: fnName,
            ip: ip,
            data: data,
            exception: err
        });
        return res.send(400, constants.syntaxIncorrect);
    }

    checkComKeyWasExchanged();
    function checkComKeyWasExchanged() {
        //Check if Com Key was exchanged so we get no spam here
        //com key was exchanged when receiver send com to sender
        var condition = {
            where: {
                senderServer: config.web.serverName,
                sender: data.receiver,
                receiver: data.sender,
                receiverServer: data.senderServer
            }
        };

        model.Communication
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
                saveMsg();
            });
    }

    function saveMsg() {
        message
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
            .success(function(msg){
                //inform all clients that saving worked/ new com key was send, just like a normal message
                global.io.sockets
                    .in('user/' + data.receiver)
                    .emit('msg/receive', {
                        id: msg.id,
                        sender: msg.sender,
                        senderServer: msg.senderServer,
                        senderKeyID: msg.senderKeyID,
                        receiver: msg.receiver,
                        receiverServer: msg.receiverServer,
                        receiverKeyID: msg.receiverKeyID,
                        text: msg.text,
                        key: msg.key
                    });


                logger.rcSuccess({
                    source: fnName,
                    ip: ip,
                    data: data
                });
                return res.json(200, true);
            });
    }
}


function routeMsgSave(req, res) {
    var ip = req.ip;
    var data = req.body;
    var user = req.session.user;
    var fnName = routeMsgSave.name;

    logger.rcIncoming({
        source: fnName.name,
        ip: ip,
        user: user,
        data: data
    });

    try {
        validations.routeMsgSave(data);
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

    var message = model.Message
        .build({
            id: data.id,
            sender: user,
            senderServer: config.web.serverName,
            senderKeyID: data.senderKeyID,
            receiver: data.receiver,
            receiverServer: data.receiverServer,
            receiverKeyID: data.receiverKeyID,
            text: data.text,
            key: data.key
        });

    var err = message.validate();
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

    if (message.senderServer != message.receiverServer){
        //we only need to do this if both use different same servers because otherwise the entry likely already exists
        message
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
        informUser(message);
    }

    function informUser(com){
        //inform all clients that saving worked/ new com key was send, just like a normal message
        sockets
            .in('user/' + user)
            .emit('msg/receive', {
                id: com.id,
                sender: com.sender,
                senderServer: com.senderServer,
                senderKeyID: com.senderKeyID,
                receiver: com.receiver,
                receiverServer: com.receiverServer,
                receiverKeyID: com.receiverKeyID,
                text: com.text,
                key: com.key
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
 * Method that the client should call on connection, to get latest Messages
 */
function routeMsgList(req, res) {
    var ip = req.ip;
    var data = req.body;
    var user = req.session.user;
    var fnName = routeMsgList.name;

    logger.rcIncoming({
        source: fnName.name,
        ip: ip,
        user: user,
        data: data
    });

    try {
        validations.routeMsgList(data);
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

    model.Message
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
 * Method that the client calls to get a specific message
 */
function routeMsgGet(req, res) {
    var ip = req.ip;
    var data = req.body;
    var user = req.session.user;
    var fnName = routeMsgGet.name;

    logger.rcIncoming({
        source: fnName.name,
        ip: ip,
        user: user,
        data: data
    });

    try {
        validations.routeMsgGet(data);
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
        attributes: ['id', 'sender', 'senderServer', 'receiverKeyID', 'senderKeyID', 'text', 'key']
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

    model.Message
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
        .success(function (msg) {
            logger.rcSuccess({
                source: fnName.name,
                ip: ip,
                user: user,
                data: data
            });
            return res.json(200, msg.values);
        });
};

global.app.post('/msg/receive', global.rcReqHandler({}), routeMsgReceive);
global.app.post('/msg/save', global.rcReqHandler({auth: true}), routeMsgSave);
global.app.post('/msg/list', global.rcReqHandler({auth: true}), routeMsgList);
global.app.post('/msg/get', global.rcReqHandler({auth: true}), routeMsgGet);


module.exports.receive = routeMsgReceive;

logger.trace("Added Message");
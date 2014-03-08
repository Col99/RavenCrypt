var model = global.model;
var logger = global.logger;
var validations = global.validations;
var constants = global.constants;

/**
 * @description Return a list Relation that a User has to others, saved here by himself
 */
function routeRelationList(req, res) {
    var ip = req.ip;
    var data = req.body;
    var fnName = routeRelationList.name;

    logger.rcIncoming({
        source: fnName,
        ip: ip,
        data: data
    });

    try {
        global.validations.routeRelationList(data);
    } catch (err) {
        logger.rcInvalid({
            source: fnName,
            ip: ip,
            data: data,
            exception: err
        });
        return res.send(400, global.constants.syntaxIncorrect);
    }

    var condition = {
        where: {
            user: data.user
        },
        limit: 20,
        order: 'createdAt DESC',
        deleted: false
    };

    if (data.since) {
        condition.where.createdAt = {};
        if (data.direction == "lt") {
            condition.where.createdAt.lt = data.since;
        } else {
            condition.where.createdAt.gt = data.since;
        }
    }

    model.ContactRelation
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
        .success(function (posts) {
            var userPosts = [];
            for (var i = 0; i < posts.length; i++)
                userPosts.push(posts[i].values)

            logger.rcSuccess({
                source: fnName,
                ip: req.ip,
                data: data
            });
            return res.json(200, userPosts);
        });
}

/**
 * @description Returns a relation, identified by UserName and ID
 */
function routeRelationGet(req, res) {
    var ip = req.ip;
    var data = req.body;
    var fnName = routeRelationGet.name;

    logger.rcIncoming({
        source: fnName,
        ip: ip,
        data: data
    });

    try {
        global.validations.routeRelationGet(data);
    } catch (err) {
        logger.rcInvalid({
            source: fnName,
            ip: ip,
            data: data,
            exception: err
        });
        return res.send(400, global.constants.syntaxIncorrect);
    }

    var condition = {
        where: {
            user: data.user,
            name: data.name,
            server: data.server,
            id: data.id
        }
    };

    model.Blog
        .find(condition)
        .error(function (err) {
            logger.rcError({
                source: fnName,
                ip: ip,
                data: data,
                exception: err
            });
            return res.send(500, constants.systemException);
        })
        .success(function (post) {

            logger.rcSuccess({
                source: fnName,
                ip: req.ip,
                data: req.body
            });
            return res.json(200, post.values);
        });
}

/**
 * @description Inserts/Updates a relation
 */
function routeRelationUpsert(req, res) {
    var ip = req.ip;
    var data = req.body;
    var user = req.session.user;
    var fnName = routeRelationUpsert.name;

    logger.rcIncoming({
        source: fnName,
        ip: ip,
        user: user,
        data: data
    });

    try {
        validations.routeContactRelationUpsert(data);
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

    //please don't add any checks for user public key here. if somebody is stupid enough to insert messages
    //with an invalid public key, he will uncover himself immediately, so no need. =)

    model.ContactRelation
        .findOrCreate({
            user: user,
            name: data.name,
            server: data.server

        }, {
            text: data.text,
            signKeyID: data.signKeyID
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
        .success(function (relation, created) {
            if(!created) {
                relation.deleted = false;
                relation.text = data.text;
                relation.signKeyID = data.signKeyID

                relation
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
                    .success(function () {
                        logger.rcSuccess({
                            source: fnName,
                            ip: ip,
                            user: user,
                            data: data
                        });
                        return res.json(200, true);
                    });
            } else {
                logger.rcSuccess({
                    source: fnName,
                    ip: ip,
                    user: user,
                    data: data
                });
                return res.json(200, true);
            }
        });

};

/**
 * @description delete a relation
 */
function routeRelationDelete(req, res) {
    var ip = req.ip;
    var data = req.body;
    var user = req.user;
    var fnName = routeRelationDelete.name;

    logger.rcIncoming({
        source: fnName,
        ip: ip,
        user: user,
        data: data
    });

    try {
        validations.routeContactRelationDelete(data);
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

    model.ContactRelation
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
        .success(function (relation) {
            relation.deleted = true;

            relation
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
                .success(function (relation) {
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


app.post('/relation/list', global.rcReqHandler({}), routeRelationList);
app.post('/relation/get', global.rcReqHandler({}), routeRelationGet);
app.post('/relation/upsert', global.rcReqHandler({auth: true}), routeRelationUpsert);
app.post('/relation/delete', global.rcReqHandler({auth: true}), routeRelationDelete);

module.exports.list = routeRelationList;
module.exports.get = routeRelationGet;
module.exports.upsert = routeRelationUpsert;
module.exports.delete = routeRelationDelete;


global.logger.trace("Added Relation");




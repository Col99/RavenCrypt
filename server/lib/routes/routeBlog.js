var model = global.model;
var logger = global.logger;
var validations = global.validations;
var constants = global.constants;

/**
 * @description Lists 20 Blog posts created  "since"(lt). lists latest 20 if no since is given. can also list newer "since"(gt)
 */
function routeBlogList(req, res) {
    var ip = req.ip;
    var data = req.body;
    var fnName = routeBlogList.name;

    logger.rcIncoming({
        source: fnName,
        ip: ip,
        data: data
    });

    try {
        validations.routeBlogList(data);
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
            user: data.user
        },
        limit: 20,
        order: 'createdAt DESC',
        deleted: false
    };

    if (data.since) {
        if (data.direction == "lt") {
            condition.where.createdAt.lt = data.since;
        }
        else {
            condition.where.createdAt.gt = data.since;
        }
    }

    model.Blog
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

};

/**
 * @description Get a specific BlogPost
 */
function routeBlogGet(req, res) {
    var ip = req.ip;
    var data = req.body;
    var fnName = routeBlogGet.name;

    logger.rcIncoming({
        source: fnName,
        ip: req.ip,
        data: data
    });

    try {
        validations.routeBlogGet(data);
    }
    catch (err) {
        logger.rcInvalid({
            source: fnName,
            by: ip,
            data: data,
            exception: err
        });
        return res.send(400, constants.syntaxIncorrect);
    }

    var condition = {
        where: {
            user: data.user,
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
};



/**
 * @description save a blog post to the server
 */
function routeBlogPost(req, res) {
    var ip = req.ip;
    var data = req.body;
    var user = req.session.user;
    var fnName = routeBlogPost.name;

    logger.rcIncoming({
        source: fnName,
        ip: ip,
        user: user,
        data: data
    });

    try {
        validations.routeBlogPost(data);
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

    model.Blog
        .findOrCreate({
            user: user,
            id: data.id
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
        .success(function (post, created) {

            if (!created) {
                //the blog post the content should NOT be changeable for quotation and signature reasons,
                //however the user should still be able to change the posts visibility.
                post.deleted = false;
                //why no hard delete?
                //what is on the internet, stays on the internet. also to prevent uuid reuse issues.

                post
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
 * @description delete a blog post
 */
function routeBlogDelete(req, res) {
    var ip = req.ip;
    var data = req.body;
    var user = req.user;
    var fnName = routeBlogDelete.name;

    logger.rcIncoming({
        source: fnName,
        ip: ip,
        user: user,
        data: data
    });

    try {
        validations.routeBlogDelete(data);
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

    model.Blog
        .find({
            where: {
                user: user,
                id: id
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
        .success(function (post) {
            post.deleted = true;

            post
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
        });
};

app.post('/blog/list', global.rcReqHandler({}), routeBlogList);
app.post('/blog/get', global.rcReqHandler({}), routeBlogGet);
app.post('/blog/post', global.rcReqHandler({auth: true}), routeBlogPost);
app.post('/blog/delete', global.rcReqHandler({auth: true}), routeBlogDelete);

module.exports.list = routeBlogList;
module.exports.get = routeBlogGet;
module.exports.post = routeBlogPost;
module.exports.delete = routeBlogDelete;

logger.trace("Added Blog");



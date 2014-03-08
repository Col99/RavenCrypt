var model = global.model;
var logger = global.logger;
var validations = global.validations;
var constants = global.constants;


/**
 * @description update the profile and set the profile pic
 */
function routeProfileUpsert(req, res) {
    var ip = req.ip;
    var data = req.body;
    var user = req.session.user;
    var fnName = routeProfileUpsert.name;

    logger.rcIncoming({
        source: fnName,
        ip: ip,
        user: user,
        data: data
    });

//    try {
//        validations.routeBlogPost(data);
//    } catch (err) {
//        logger.rcInvalid({
//            source: fnName,
//            ip: ip,
//            user: user,
//            data: data,
//            exception: err
//        });
//        return res.send(400, constants.syntaxIncorrect);
//    }
//
//    //please don't add any checks for user public key here. if somebody is stupid enough to insert messages
//    //with an invalid public key, he will uncover himself immediately, so no need. =)
//
//    model.Blog
//        .findOrCreate({
//            user: user,
//            id: data.id
//        }, {
//            text: data.text,
//            signKeyID: data.signKeyID
//        })
//        .error(function (err) {
//            logger.rcError({
//                source: fnName,
//                ip: ip,
//                user: user,
//                data: data,
//                exception: err
//            });
//            return res.send(500, constants.systemException);
//        })
//        .success(function (post, created) {
//
//            if (!created) {
//                //the blog post the content should NOT be changeable for quotation and signature reasons,
//                //however the user should still be able to change the posts visibility.
//                post.deleted = false;
//                //why no hard delete?
//                //what is on the internet, stays on the internet. also to prevent uuid reuse issues.
//
//                post
//                    .save()
//                    .error(function (err) {
//                        logger.rcError({
//                            source: fnName,
//                            ip: ip,
//                            user: user,
//                            data: data,
//                            exception: err
//                        });
//                    })
//                    .success(function () {
//                        logger.rcSuccess({
//                            source: fnName,
//                            ip: ip,
//                            user: user,
//                            data: data
//                        });
//                        return res.json(200, true);
//                    });
//            } else {
//                logger.rcSuccess({
//                    source: fnName,
//                    ip: ip,
//                    user: user,
//                    data: data
//                });
//                return res.json(200, true);
//            }
//        });
};


/**
 * @description Get a Profile as well as its picture..
 */
function routeProfileGet(req, res) {
    var ip = req.ip;
    var data = req.body;
    var fnName = routeProfileGet.name;

    logger.rcIncoming({
        source: fnName,
        ip: req.ip,
        data: data
    });
//
//    try {
//        validations.routeBlogGet(data);
//    }
//    catch (err) {
//        logger.rcInvalid({
//            source: fnName,
//            by: ip,
//            data: data,
//            exception: err
//        });
//        return res.send(400, constants.syntaxIncorrect);
//    }
//
//    var condition = {
//        where: {
//            user: data.user,
//            id: data.id
//        }
//    };
//
//    model.Blog
//        .find(condition)
//        .error(function (err) {
//            logger.rcError({
//                source: fnName,
//                ip: ip,
//                data: data,
//                exception: err
//            });
//            return res.send(500, constants.systemException);
//        })
//        .success(function (post) {
//
//            logger.rcSuccess({
//                source: fnName,
//                ip: req.ip,
//                data: req.body
//            });
//            return res.json(200, post.values);
//        });
};


app.post('/profile/get', global.rcReqHandler({}), routeProfileGet);
app.post('/profile/upsert', global.rcReqHandler({auth: true}), routeProfileUpsert);

module.exports.get = routeProfileGet;
module.exports.upsert = routeProfileUpsert;

logger.trace("Added Upsert");



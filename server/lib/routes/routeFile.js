var config = global.config;
var model = global.model;
var logger = global.logger;
var validations = global.validations;
var constants = global.constants;
var helper = global.helper;

var fs = require('fs');
var Busboy = require('busboy');
var inspect = require('util').inspect;

/**
 * @description Returns a JSON object containing a base 64 file with info
 */
function routeFileGet(req, res) {
    var ip = req.ip;
    var data = req.body;
    var fnName = routeFileGet.name;

    logger.rcIncoming({
        source: fnName,
        ip: ip,
        data: data
    });

    try {
        validations.routeFileGet(data);
    } catch (err) {
        logger.rcError({
            source: fnName,
            ip: ip,
            data: data,
            exception: err
        });
        return res.send(400, constants.syntaxIncorrect);
    }

    var condition = {
        where: {
            user: data.user,
            hash: data.hash
        }
    };

    model.File
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
        .success(function (file) {

            if(file) {
                var filePath = config.filePath + file.user + "/" + file.hash;

//                fs.readFile(filePath, null, function(err, fileData){
//                    if(err){
//                        logger.rcError({
//                            source: fnName,
//                            ip: ip,
//                            data: data,
//                            exception: err
//                        });
//                        return res.send(500, constants.systemException);
//                    };

                logger.rcSuccess({
                    source: fnName,
                    ip: ip,
                    data: data
                });

                var headers = {
                    'Content-Type': encodeURIComponent(file.mimeType),
                    'X-Signature': encodeURIComponent(file.signature),
                    'X-SignKeyID': encodeURIComponent(file.signKeyID),
                    'Content-disposition': 'attachment; filename=' + file.hash
                };

                if(data.encParams){
                    headers['X-Encryption'] = encodeURIComponent(file.encryption)
                }

                res.writeHead(200,
                    headers
                );

                var fileStream = fs.createReadStream(filePath);
                fileStream.pipe(res);


//                    return res.send(200, fileData);
//                });
            } else {
                logger.rcSuccess({
                    source: fnName,
                    ip: ip,
                    data: data
                });
                return res.json(404, "404 File not found");
            }
        });
};


function handleForm(req, res, cb){
    var fnName = handleForm.name;
    var ip = req.ip;

    var busboyOptions = {
        headers: req.headers,
        limits: {
            fields: 4,
            files: 1,
            fieldNameSize: 100,
            fieldSize: 1000,
            fileSize: 1024 * 1024 * 2
        }
    };

    //https://github.com/mscdex/busboy
    var busboy = new Busboy(busboyOptions);
    var busboyCanceled = false;

    var fields = {};
    var files = [];

    function invalidForm(err){
        logger.rcInvalid({
            source: fnName,
            ip: ip,
            exception: err
        });
        busboyCanceled = true;
        busboy.end();
        req.destroy();
        res.send(400, constants.syntaxIncorrect);
        return res.end();
    }

    busboy.on('file', function(fieldName, fileStream, fileName, encoding, mimeType) {
        var thisFile = {
            encoding: encoding,
            mimeType: mimeType,
            fileName: fileName,
            data: null
        };

        fileStream.on('data', function(data) {
            if(busboyCanceled){
                return;
            }

            if(fileStream.truncated){
                //this does not work for some reason???
                //see double check below
                invalidForm("file truncated");
            }

            if(thisFile.data != null) {
                thisFile.data = Buffer.concat([thisFile.data, data]);
            } else {
                thisFile.data = data;
            }


            if(thisFile.data.length >= busboyOptions.limits.fileSize){
                invalidForm("file truncated");
            }
        });
        fileStream.on('end', function() {
            files.push(thisFile);
        });
    });
    busboy.on('field', function(fieldname, val, valTruncated, keyTruncated) {
        if(busboyCanceled){
            return;
        }
        if(valTruncated){
            invalidForm("fieldVal truncated");
        }
        if(keyTruncated){
            invalidForm("fieldKey truncated");
        }

        fields[fieldname] = val;
    });
    busboy.on('finish', function() {
        if(busboyCanceled){
            return;
        }

        req.fields = fields;
        req.files = files;

        cb();
    });

    req.pipe(busboy);
}

/**
 * @description Save User File
 * @param req
 * @param res
 * @returns {*}
 */
function routeFileUpload(req, res) {

    //TODO:
    //If we want to save bigger files, we should probably
    //change this to progressively save and hash them.
    //we should also check if the file exists and close the stream
    //before receiving everything to save bandwidth.

    handleForm(req, res, function(){
        var fnName = routeFileUpload.name;
        var ip = req.ip;
        var data = req.fields; //this is form data, so we need the fields.
        var user = req.session.user;

        logger.rcIncoming({
            source: fnName,
            ip: ip,
            user: user,
            data: data
        });

        try {
            validations.routeFileUpload(data);
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

        //we should upload a file here :-)
        if(req.files.length != 1){
            logger.rcInvalid({
                source: fnName,
                ip: ip,
                user: user,
                data: data,
                exception: err
            });
            return res.send(400, constants.syntaxIncorrect);
        }

        //Validate against model
        var file = model.File
            .build({
                user: user,
                hash: data.hash,
                encryption: data.encryption,
                signature: data.signature,
                signKeyID: data.signKeyID,
                mimeType: req.files[0].mimeType
            });

        var err = file.validate();
        if(err) {
            logger.rcInvalid({
                user: user,
                source: fnName,
                ip: ip,
                data: data,
                exception: err
            });
            return res.send(400, constants.syntaxIncorrect);
        }

        var userFolder = config.filePath + file.user;
        var filePath = userFolder + "/" + file.hash;

        fs.mkdir(userFolder,null, function(err){
            if(err && err.errno != 47){
                logger.rcError({
                    source: fnName,
                    ip: ip,
                    user: user,
                    data: data,
                    exception: err
                });
                return res.send(500, constants.systemException);
            }

            fs.exists(filePath, function(exists){
                if(exists){
                    logger.rcSuccess({
                        user: user,
                        source: fnName,
                        ip: ip,
                        data: data
                    });
                    return res.send(200, false); //File already exists
                }

                //check if we received everything correctly
                var buf = req.files[0].data;
                var contents = buf.toString();

                //this costs a lot of memory..
//                var arrayBuffer = global.helper.toArrayBufferBin(buf);
//                var contents = global.helper.ab2str(arrayBuffer);


                var hash = openpgp.crypto.hash.sha256(contents);
                var hexHash = openpgp.util.hexstrdump(hash);

                if(hexHash != data.hash){
                    logger.rcInvalid({
                        source: fnName,
                        ip: ip,
                        user: user,
                        data: data,
                        exception: err
                    });
                    return res.send(400, constants.sessionBadUpload);
                }


                fs.writeFile(filePath, contents, {encoding: 'utf8'}, function(err){
                    if(err) {
                        logger.rcError({
                            source: fnName,
                            ip: ip,
                            user: user,
                            data: data,
                            exception: err
                        });
                        return res.send(500, constants.systemException);
                    }
                    dbInsert(file);
                });
            });
        });

        function dbInsert(file){
            file
                .save()
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
                .success(function (file) {
                    logger.rcSuccess({
                        user: user,
                        source: fnName,
                        ip: ip,
                        data: data
                    });

                    res.send(200, true);
                });
        }
    });
}

/**
 * @description delete an file post
 * @param socket
 * @param data
 */
function routeFileDelete(req, res) {
    var ip = req.ip;
    var data = req.body;
    var user = req.user;
    var fnName = routeFileDelete.name;

    logger.rcIncoming({
        source: fnName,
        ip: ip,
        user: user,
        data: data
    });

    try {
        validations.routeFileDelete(data);
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

    var condition = {
        where: {
            user: user,
            hash: data.hash
        }
    };


    var filePath = config.filePath + user + "/" + data.hash;

    fs.unlink(filePath, function (err) {
//        if (err) {
//        }
        //doesn't matter if the file really existed or not
        deleteFromDb();
    });

    function deleteFromDb() {
        model.File
            .find(condition)
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
                post
                    .destroy()
                    .error(function (err) {
                        logger.rcError({
                            source: fnName,
                            ip: ip,
                            user: user,
                            data: data,
                            exception: err
                        });
                        return res.json(500, constants.systemException);
                    })
                    .success(function (succeeded) {
                        if(succeeded) {
                            logger.rcSuccess({
                                source: fnName,
                                ip: ip,
                                data: data
                            });
                            return res.send(200, true);
                        } else {
                            logger.rcInvalid({
                                source: fnName,
                                ip: ip,
                                user: user,
                                data: data,
                                exception: "404 File not found"
                            });
                            return res.send(404, "404");
                        }
                    });
            });
    }
};

global.app.post('/file/get', global.rcReqHandler({}), routeFileGet);
global.app.post('/file/upload', global.rcReqHandler({auth: true, passThrough: true}), routeFileUpload);
global.app.post('/file/delete', global.rcReqHandler({auth: true}), routeFileDelete);

module.exports.get = routeFileGet;
module.exports.upload = routeFileGet;

logger.trace("Added Files");
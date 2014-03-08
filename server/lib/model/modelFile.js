var DataTypes = global.db.Sequelize;
var sequelize = global.db.sequelize;
var config = global.config;

//images should be stored as files, but also referenced in the db.
//keep track of the users who uploaded them (can be multiple so not primary key)
//use hash(sha38X) as th as primary key, max filesize 1mb for now.
//there should also be a column in the db for an encrypted flag.


global.model.File =
    sequelize.define('File', {
        user: {
            type: DataTypes.STRING(config.validations.user.maxLen),
            primaryKey: true,
            validate: {
                is: config.validations.user.regExpText
            }
        },
        hash: {
            comment: "should always be a Hex encoded 256 bit SHA3 Hash",
            type: DataTypes.STRING(config.validations.hex256Len),
            primaryKey: true,
            validate: {
                is: config.validations.hex256RegExpText
            }
        },
        mimeType: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        encryption: {
            comment: "encryption materials for this Files, encrypted with the public key of the user, " +
                "(so he can get them if hit lost them). NULL if the Files is not encrypted",
            type: DataTypes.STRING,
            allowNull: true,
            validate: {
                isPGPMsg: function (value) {
                    if(value) {
                        try {
                            openpgp.message.readArmored(value);
                        } catch(err) {
                            throw constants.noPGPMsg;
                        }
                    }
                }
            }
        },
        signature: {
            comment: "signed hash of the Files. hash of encrypted Files, if Files is encrypted.",
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                isPGPMsg: function (value) {
                    if(value) {
                        try {
                            openpgp.message.readArmored(value);
                        } catch(err) {
                            throw constants.noPGPMsg;
                        }
                    }
                }
            }
        },
        signKeyID: {
            comment: "public key our user used to sign the hash",
            type: DataTypes.STRING(config.validations.pubKeyID.length),
            allowNull: false,
            validate: {
                is: config.validations.hex256RegExpText,
                len: [config.validations.pubKeyID.length]
            }
        },
        createdAt: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
            allowNull: false
        }
    });

global.logger.trace("Added Files");
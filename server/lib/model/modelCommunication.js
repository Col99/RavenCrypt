var DataTypes = global.db.Sequelize;
var sequelize = global.db.sequelize;
var config = global.config;
var openpgp = global.openpgp;
var constants = global.constants;

///model to store public key encrypted communication keys
global.model.Communication =
    sequelize.define('Communication', {
        id: {
            type: DataTypes.STRING(36),
            primaryKey: true,
            validate: {
                isUUID: 4
            }
        },
        createdAt: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
            allowNull: false
        },
        receiver: {
            type: DataTypes.STRING(config.validations.user.maxLen),
            primaryKey: true,
            validate: {
                is: config.validations.user.regExpText
            }
        },
        receiverServer: {
            type: DataTypes.STRING(config.validations.server.maxLen),
            primaryKey: true,
            validate: {
                is: config.validations.server.regExpText
            }
        },
        receiverKeyID: {
            comment: "the pubKeyID the sender used to encrypt the request",
            type: DataTypes.STRING(config.validations.pubKeyID.length),
            allowNull: false,
            validate: {
                len: [config.validations.pubKeyID.length]
            }
        },
        sender: {
            type: DataTypes.STRING(config.validations.user.maxLen),
            primaryKey: true,
            validate: {
                is: config.validations.user.regExpText
            }
        },
        senderServer: {
            type: DataTypes.STRING(config.validations.server.maxLen),
            primaryKey: true,
            validate: {
                is: config.validations.hex256RegExpText,
                is: config.validations.server.regExpText
            }
        },
        senderKeyID: {
            comment: "the pubKeyID form the sender that is used to sign this message, that the receiver can use to validate this key",
            type: DataTypes.STRING(config.validations.pubKeyID.length),
            allowNull: false,
            validate: {
                is: config.validations.hex256RegExpText,
                len: [config.validations.pubKeyID.length]
            }
        },
        text: {
            type: DataTypes.TEXT,
            allowNull: false,
            comment: "this should usually be half a key and half an iv, encrypted with the public key of the receiver." +
                "this should also contain which algorithm was used, described an integer 0=AES256_CTR" +
                "example {keyHalf: ..., ivHalf: ..., algorithm: 0}" +
                "also in here are the comRequests",
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
        }
    });

global.logger.trace("Added Communication");
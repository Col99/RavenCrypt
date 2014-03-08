var DataTypes = global.db.Sequelize;
var sequelize = global.db.sequelize;
var config = global.config;

//public keys of contacts, saved here to share between devices

global.model.ContactKey =
    sequelize.define('ContactKey', {
    user: {
        type: DataTypes.STRING(config.validations.user.maxLen),
        primaryKey: true,
        validate: {
            is: config.validations.user.regExpText
        }
    },
    name: {
        type: DataTypes.STRING(config.validations.user.maxLen),
        primaryKey: true,
        validate: {
            is: config.validations.user.regExpText
        }
    },
    server: {
        type: DataTypes.STRING(config.validations.server.maxLen),
        primaryKey: true,
        validate: {
            is: config.validations.user.regExpText
        }
    },
    deleted: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    keyID:{
        type: DataTypes.STRING(config.validations.pubKeyID.length),
        validate: {
            is: config.validations.hex256RegExpText,
            len: [config.validations.pubKeyID.length]
        },
        primaryKey: true
    },
    key: {
        type: DataTypes.STRING,
        allowNull: false
    },
    verification: {
        comment: "PGPSignedMessage({publicKey: ..., verification ['qrcode', 'e-mail'] })",
        type: DataTypes.TEXT,
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
    verificationSignKeyID:{
        type: DataTypes.STRING,
        validate: {
            len: [config.validations.pubKeyID.length]
        },
        primaryKey: true
    },
    forCom: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false
    },
    changedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        allowNull: true
    }
});

global.logger.trace("Added ContactKey");
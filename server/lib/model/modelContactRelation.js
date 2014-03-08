var DataTypes = global.db.Sequelize;
var sequelize = global.db.sequelize;
var config = global.config;
var openpgp = global.openpgp;

//the relation our user has to others
//these are published on his blog.
//by default in here is also a collection of PublicKeys
//so this is not just useless junk info, but a system for crowd-validation :-)

global.model.ContactRelation =
    sequelize.define('ContactRelation', {
    user: {
        type: DataTypes.STRING(config.validations.user.maxLen),
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
    text: {
        comment: "PGPSignedMessage({relation: ...(eg. friend), publicKeysVerifications:{keyId1: ['QR-Code', 'Other'], keyId2: ['QR-Code', 'NFC']}})",
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
        comment: "Public key our user used to sign the relation",
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

global.logger.trace("Added ContactRelation");
var DataTypes = global.db.Sequelize;
var sequelize = global.db.sequelize;
var config = global.config;

global.model.UserProfile =
    sequelize.define('UserProfile', {
    user: {
        type: DataTypes.STRING(config.validations.user.maxLen),
        primaryKey: true,
        allowNull: false
    },
    text: {
        comment: "PGPSigned{Text}",
        type: DataTypes.TEXT,
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
    profilePicHash: {
        comment: "should always be a Hex encoded 256 bit SHA3 Hash",
        type: DataTypes.STRING(config.validations.hex256Len),
        primaryKey: true,
        validate: {
            is: config.validations.hex256RegExpText
        }
    },
    profilePicMimeType: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    signKeyID: {
        type: DataTypes.STRING(config.validations.pubKeyID.length),
        allowNull: false,
        validate: {
            len: [config.validations.pubKeyID.length]
        }
    },
    modifiedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        allowNull: true
    },
    createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        allowNull: false
    }
});

global.logger.trace("Added UserProfile");
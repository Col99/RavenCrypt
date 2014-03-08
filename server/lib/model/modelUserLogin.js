var DataTypes = global.db.Sequelize;
var sequelize = global.db.sequelize;
var config = global.config;

global.model.UserLogin =
    sequelize.define('UserLogin', {
    name: {
        type: DataTypes.STRING(config.validations.user.maxLen),
        primaryKey: true
    },
    keyID: {
        type: DataTypes.STRING,
        validate: {
            is: config.validations.hex256RegExpText,
            len: [config.validations.pubKeyID.length]
        },
        primaryKey: true
    },
    cached: {
        comment: "Cached entry, ready to send. This is a little protection mechanism, against huge amounts of Async key operations",
        type: DataTypes.STRING,
        validate: {
            isPGPMsg: function (value) {
                if(value) {
                    try {
                        global.openpgp.message.readArmored(value);
                    } catch(err) {
                        throw global.constants.noPGPMsg;
                    }
                }
            }
        }
    },
    sessionKeyID: {
        type: DataTypes.INTEGER
    },
    validUntil: {
        type: DataTypes.DATE
    },
    createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        allowNull: false
    }
});

global.logger.trace("Added UserLogin");
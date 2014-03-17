var DataTypes = global.db.Sequelize;
var sequelize = global.db.sequelize;
var config = global.config;

global.model.PhoneToRc =
    sequelize.define('PhoneToRc', {
    name: {
        type: DataTypes.STRING(config.validations.PhoneNo.maxLen),
        primaryKey: true,
        allowNull: false,
        validate: {
            is: config.validations.PhoneToRc.regExpText
        }
    },
    displayName: {
        type: DataTypes.STRING(config.validations.RcAddress.maxLen),
        primaryKey: true,
        allowNull: false,
        validate: {
            is: config.validations.PhoneToRc.displayRegExpText
        }
    },
    confirmId: {
        type: DataTypes.STRING(config.validations.confirmId.maxLen),
        defaultValue: false,
        allowNull: false
    },
    banned: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false
    },
    createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        allowNull: false
    }
});

global.logger.trace("PhoneToRC record added");

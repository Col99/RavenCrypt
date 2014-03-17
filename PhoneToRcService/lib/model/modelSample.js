var DataTypes = global.db.Sequelize;
var sequelize = global.db.sequelize;
var config = global.config;

global.model.User =
    sequelize.define('User', {
    name: {
        type: DataTypes.STRING(config.validations.user.maxLen),
        primaryKey: true,
        validate: {
            is: config.validations.user.regExpText
        }
    },
    displayName: {
        type: DataTypes.STRING(config.validations.user.maxLen),
        allowNull: false,
        validate: {
            is: config.validations.user.displayRegExpText
        }
    },
    banned: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false
    },
    createdAt: {
        type: DataTypes.DATE,
        defaultValue: null,
        allowNull: true
    }
});


global.logger.trace("Added User");
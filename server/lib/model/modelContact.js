var DataTypes = global.db.Sequelize;
var sequelize = global.db.sequelize;
var config = global.config;

//saved here for device sync

global.model.Contact =
    sequelize.define('Contact', {
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
    deleted: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    server: {
        type: DataTypes.STRING(config.validations.server.maxLen),
        primaryKey: true,
        validate: {
            is: global.config.validations.user.regExpText
        }
    },
    keepComAlive: {
        comment: "indicates if the user wishes to renew his comKeys regularly with the Contact before they run out" +
                 "this flag is set to true if the communication needs to be regularly maintained" +
                 "e.g. a business relationship where you don't do business on a regular basis, but need maintenance." +
                 "usually comKeys get renewed when you write messages to that contact " +
                 "and the auto renew check triggers in the client, meaning that if you don't write regularly they run out",
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false
    },
    comKeyCount: {
        comment: "here the user keeps track of how many com keys he assigned to avoid duplications",
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    changedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        allowNull: false
    }
});

global.logger.trace("Added Contact");
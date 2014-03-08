var DataTypes = global.db.Sequelize;
var sequelize = global.db.sequelize;
var config = global.config;
var openpgp = global.openpgp;

//Blogposts of our user
//These should not be modifiable, otherwise its EXTREMELY hard to implement any "quoiting" later.

global.model.Blog =
    sequelize.define('Blog', {
        user: {
            type: DataTypes.STRING(config.validations.user.maxLen),
            primaryKey: true,
            validate: {
                is: config.validations.user.regExpText
            }
        },
        id: {
            type: DataTypes.STRING(36),
            allowNull: false,
            validate: {
                isUUID: 4
            },
            primaryKey: true
        },
        deleted: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },
        text: {
            comment: "PGPSigned{Text}",
            allowNull: false,
            type: DataTypes.TEXT,
            validate: {
                isPGPMsg: function (value) {
                    if(value) {
                        try {
                            openpgp.read_message(value);
                        } catch(err) {
                            throw global.constants.noPGPMsg;
                        }
                    }
                }
            }
        },
        signKeyID: {
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

global.logger.trace("Added Blog");
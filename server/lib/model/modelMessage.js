var DataTypes = global.db.Sequelize;
var sequelize = global.db.sequelize;
var config = global.config;

global.model.Message =
    sequelize.define(
        'Message',
        {
            id: {
                type: DataTypes.STRING(36),
                validate: {
                    isUUID: 4
                },
                primaryKey: true
            },
            createdAt: {
                type: DataTypes.DATE,
                defaultValue: DataTypes.NOW,
                allowNull: false
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
                    is: config.validations.server.regExpText
                }
            },
            senderKeyID: {
                type: DataTypes.INTEGER,
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
                type: DataTypes.INTEGER,
                allowNull: false
            },
            text: {
                comment: "messageText",
                type: DataTypes.TEXT,
                allowNull: false
            },
            key: {
                type: DataTypes.STRING,
                comment: "messageKey: key this message is encrypted with. this key itself is encrypted with the combined Com-Keys of sender and receiver",
                allowNull: false
            }
        }, {
            validate: {
                receiverServerVal: function() {
//                    if(this.direction = 0){
//                        if(this.receiverServer) {
//                            if(!rxUrl.test(this.receiverServer))
//                                throw "receiver server must be an url";
//
//                        }
//                    }
                },
                senderServerVal: function() {
//                    if(this.direction = 1){
//                        if(this.senderServer) {
//                            if(!rxUrl.test(this.senderServer))
//                                throw "sender server must be an url";
//
//                        }
//                    }
                }
            }
        }
    );


global.logger.trace("Added Message");

var DataTypes = global.db.Sequelize;
var sequelize = global.db.sequelize;
var config = global.config;

var openpgp = global.openpgp;

global.model.UserKey =
    sequelize.define('UserKey', {
        name: {
            type: DataTypes.STRING(config.validations.user.maxLen),
            primaryKey: true

        },
        keyID: {
            type: DataTypes.STRING(config.validations.pubKeyID.length),
            primaryKey: true,
            validate: {
                is: config.validations.hex256RegExpText,
                len: [config.validations.pubKeyID.length]
            }
        },
        key: {
            type: DataTypes.STRING,
            allowNull: false
        },
        deleted: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            allowNull: false
        },
        forLogin: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            allowNull: false
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
    }, {
        validate: {
            keyIdIsPublicKeyHash: function() {
                var hash = openpgp.crypto.hash.sha256(this.key);
                var hexHash = openpgp.util.hexstrdump(hash);

                if(hexHash != this.keyID){
                    throw "keyID must be base64 encoded 64bit SHA3 hash!";
                }
            }
        },
        instanceMethods: {
            write_encrypted_message: function (message) {
                var publicKeys = openpgp.key.readArmored(this.key);
                return openpgp.encryptMessage(publicKeys.keys, message);
            }
        }
    });

global.logger.trace("Added UserKeys");
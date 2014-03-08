var DataTypes = global.db.Sequelize;
var sequelize = global.db.sequelize;
var config = global.config;

var openpgp = global.openpgp;
var constants = global.constants;
var validations = global.validations;

global.model.UserRegister =
    sequelize.define('UserRegister', {
        name: {
            type: DataTypes.STRING(config.validations.user.maxLen),
            primaryKey: true,
            validate: {
                is: config.validations.user.regExpText
            }
        },
        displayName: {
            type: DataTypes.STRING(config.validations.user.maxLen),
            validate: {
                is: config.validations.user.displayRegExpText
            }
        },
        activationCode: {
            type: DataTypes.STRING,
            allowNull: false
        },
        createdAt: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
            allowNull: false
        },
        publicKey: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                checkPGPKey: function(value) {
                    validations.checkPGPKey(value);
                }
            }
        },
        keyID: {
            type: DataTypes.STRING(config.validations.pubKeyID.length),
            validate: {
                is: config.validations.hex256RegExpText,
                len: [config.validations.pubKeyID.length]
            }
        }
    }, {
        validate: {
            keyIDisPublicKeyHash: function() {
                var hash = openpgp.crypto.hash.sha256(this.publicKey);
                var hexHash = openpgp.util.hexstrdump(hash);

                if(hexHash != this.keyID){
                    throw "keyID must be base64 encoded 64bit SHA3 hash!";
                }
            }
        },
        classMethods: {
            read_message: function (message) {
                var pgpMsg = openpgp.cleartext.readArmored(message);
                return pgpMsg;
            }
        },
        instanceMethods: {
            write_encrypted_message: function (message) {
                var publicKeys = openpgp.key.readArmored(this.publicKey);
                return openpgp.encryptMessage(publicKeys.keys, message);
            },
            check_message: function(pgpmsg){
                var publicKeys = openpgp.key.readArmored(this.publicKey);
                var verified = openpgp.verifyClearSignedMessage(publicKeys.keys, pgpmsg);

                if(verified.signatures.length == 0){
                    return false;
                }

                for(var i=0; i<verified.signatures.length;i++){
                    if(!verified.signatures[i].valid) {
                        return verified.signatures[0].valid;
                    }
                }

                return true;

            }
        }
    });


global.logger.trace("Added UserRegister");
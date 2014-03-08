var crypto = require('crypto');

var DataTypes = global.db.Sequelize;
var sequelize = global.db.sequelize;
var config = global.config;

var openpgp = global.openpgp;

var symmAlgo = "aes256"; // AES256

global.model.ServerSessionKey =
    sequelize.define('ServerSessionKey', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        key: {
            type: DataTypes.STRING(config.validations.hex256Len),
            allowNull: false
        },
        iv: {
            type: DataTypes.STRING(config.validations.hex256Len),
            allowNull: false
        },
        algorithm: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            comment: "crypto algorithm this key uses. 0=aes256-CTR",
            allowNull: false
        },
        createdAt: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
            allowNull: false
        }
    }, {
        classMethods: {
            generate: function(){
                var rnd = {};

                var key = openpgp.crypto.generateSessionKey(symmAlgo);
                var iv = openpgp.crypto.generateSessionKey(symmAlgo);

                rnd.key = openpgp.util.hexstrdump(key);
                rnd.iv = openpgp.util.hexstrdump(iv);

                return rnd;
            }
        },
        instanceMethods: {
            encrypt: function(text){
                var key =  openpgp.util.hex2bin(this.key);
                var iv = openpgp.util.hex2bin(this.iv);

                var encrypted = openpgp.crypto.cfb.normalEncrypt(symmAlgo, key, text, iv);

                encrypted = openpgp.util.hexstrdump(encrypted);

                return encrypted;
            },
            decrypt:function(encrypted){
                var key =  openpgp.util.hex2bin(this.key);
                var iv = openpgp.util.hex2bin(this.iv);

                var encrypted =  openpgp.util.hex2bin(encrypted);

                var decrypted = openpgp.crypto.cfb.normalDecrypt(symmAlgo, key, encrypted, iv);

                return decrypted;
            }
        }
    });


global.logger.trace("Added ServerSessionKey");
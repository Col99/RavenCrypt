//this file should create our basic database layout in our first 'official' release version.
//in later versions we will then create new migrations to amend new changes to this layout :-)

var Sequelize = require(__dirname + '/../node_modules/sequelize/index');

module.exports = {
  up: function(migration, DataTypes, done) {

      var sequelize = migration.migrator.sequelize;

      //example for custom SQL (DO NOT DELETE)!
      //sequelize.query('ALTER TABLE my_table ADD PRIMARY KEY(id)');

//      sequelize.define('Messages', {
//          receiver: { type: DataTypes.STRING },
//          keyIdSender: { type: DataTypes.STRING },
//          keyIdReceiver: {type: DataTypes.STRING },
//          message: { type: DataTypes.TEXT },
//          createdAt: {
//              type: DataTypes.BOOLEAN,
//              defaultValue: Sequelize.NOW,
//              allowNull: false
//          },
//          server: {
//              type: DataTypes.STRING,
//              defaultValue: null,
//              allowNull: true
//          },
//          deliverAttempts: {
//              type: DataTypes.INTEGER,
//              defaultValue: null,
//              allowNull: true
//          },
//          attemptDate: {
//              type: DataTypes.DATE,
//              defaultValue: null,
//              allowNull: true
//          },
//          deliverDate: {
//              type: DataTypes.INTEGER,
//              defaultValue: null,
//              allowNull: true
//          }
//      });

      sequelize.sync().complete(done);
  },
  down: function(migration, DataTypes, done) {
      //thats one way to do it :D - might be dangerous if other tables are in the db
      migration.dropAllTables().complete(done);
  }
}
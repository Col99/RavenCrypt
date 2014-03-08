Notes:

currently the database has to configured in config.json and config.js
TODO: unify database config


Useful:

'-e, --env <environment>', 'Specify the environment.'
'-m, --migrate', 'Run pending migrations.'
'-u, --undo', 'Undo the last migration.'
'-c, --create-migration [migration-name]', 'Creates a new migration.'

create new migration: //(YOU STILL HAVE TO CODE THESE OUT, YOU JUST SPECIFY THE MIGRATION NAME  WITH THESE COMMANDS)
sequelize -c createCheese
sequelize -c alterCheese
sequelize -c dropCheese

run migrations:
sequelize -m

set environment (default is development):
sequelize -e development
sequelize -e test
sequelize -e production


Migrations create two tables SequelizeMeta and sqlite/postgres/mysql _sequence
We can use these to see in what state the Database currently is. :-)
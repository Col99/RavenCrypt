var openpgp = require('openpgp');

openpgp.config.compression = 0;
openpgp.config.show_version = false;
openpgp.config.show_comment = false;

global.openpgp = openpgp;

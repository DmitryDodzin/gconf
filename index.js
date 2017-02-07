
const gconf = require('./lib/singleton');

gconf.GConf = require('./lib/gconf');
gconf.components = require('./lib/components/factory');

module.exports = gconf;

require('./lib/rcloader');

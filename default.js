
const gconf = require('./index');

module.exports = gconf.instance ? gconf.instance.default : null;
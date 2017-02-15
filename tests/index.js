
const gconf = require('../index');
const GConf = gconf.GConf;
const ProviderTester = require('./provider.tester');

describe('provider', () => {

  describe('memory', () => {

    let gconf_instance = new GConf();

    let tester = new ProviderTester(gconf_instance);

    let memoryConfig = {};
    tester.domains.forEach(domain => {
      memoryConfig[domain] = tester.createTestData(domain);
    });

    gconf_instance.registerProvider('memory', memoryConfig);

    tester.test();

  });

});
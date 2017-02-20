
const path = require('path');
const mock_fs = require('mock-fs');
const YAML = require('yamljs');

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

  describe('file provider', () => {

    let gconf_instance = new GConf();

    let tester = new ProviderTester(gconf_instance);

    var jsonFiles = tester.domains.map(domain => {
      domain = 'j' + domain;
      return { 
        domain, 
        name: '/' + domain + '.json', 
        data: JSON.stringify(tester.createTestData(domain))
      };
    });
    var yamlFiles = tester.domains.map(domain => {
      domain = 'y' + domain;
      return { 
        domain, 
        name: '/' + domain + '.yaml', 
        data: YAML.stringify(tester.createTestData(domain))
      };
    });

    var files = [].concat(jsonFiles, yamlFiles);
    tester.domains = files.map(file => file.domain);

    var configPath = '/arse/';
    var fsConfig = {};
    fsConfig[configPath] = {};

    files.forEach(file => {
      fsConfig[configPath][file.name.substring(1)] = file.data;
    });

    fileConfig = {};
    files.forEach(file => {
      fileConfig[file.domain] = path.join(configPath, file.name);
    });

    before(() => {
      mock_fs(fsConfig);  
    });

    before(() => {
      gconf_instance.registerProvider('file', fileConfig);
    });

    tester.test();

    after(() => {
      mock_fs.restore();
    });
  });

});

const _ = require('lodash');
const path = require('path');
const sinon = require('sinon');
const chai = require('chai');
const assert = chai.assert;
const expect = chai.expect;
const mock_fs = require('mock-fs');
const YAML = require('yamljs');

const gconf = require('./index');
const GConf = gconf.GConf;

describe('core gconf functionality', () => {

  var gconf_instance;

  beforeEach(() => {
    gconf_instance = new GConf();
  });

  it('load provider', done => {

    let MemoryProvider = require('./lib/components/providers/memory');

    gconf_instance.registerProvider('memory');

    assert.instanceOf(gconf_instance.provider, MemoryProvider);

    done();
  });

  it('load modifiers', done => {

    let EnvModifier = require('./lib/components/modifiers/env');

    gconf_instance.registerModifier('env');

    assert.instanceOf(gconf_instance.modifier_queue[0], EnvModifier);

    done();
  });

  describe('memory provider', () => {

    var base_config = {
        dev: {
          foo: 'bar'
        },
        prod: {
          foo: 'bar2000'
        },
        test: {
          foo: {
            bar: 2000
          }
        },
        default: {
          isFoo: false
        }
      };

    it('no provider fail', done => {

      assert.throws(gconf_instance.request.bind(gconf_instance));

      done();
    });

    it('env selection', () => {

      gconf_instance.registerProvider('memory', base_config);

      let dev_config = gconf_instance.request('dev');

      assert.deepEqual(dev_config, { foo: 'bar' });

      let prod_config = gconf_instance.request('prod');
      assert.deepEqual(prod_config, { foo: 'bar2000' });
      
    });

    it('path selection', done => {
      
      gconf_instance.registerProvider('memory', base_config);

      assert.equal(gconf_instance.request('dev', 'foo'), 'bar');
      assert.equal(gconf_instance.request('test', 'foo.bar'), 2000);

      done();

    });

    it('default domain selection', done => {
      
      gconf_instance.registerProvider('memory', base_config);

      assert.deepEqual(gconf_instance.request(), base_config.default);

      done();

    });

    it('changed default domain selection', done => {
      
      gconf_instance.registerProvider('memory', base_config);

      gconf_instance.meta.default_domain = 'test';

      assert.deepEqual(gconf_instance.request(), base_config.test);

      done();

    });
  });

  describe('env modifier', () => {
    const base_config = {
      foo: 'bar',
      complex: {
        foo: {
          bar: 2000
        }
      }
    };

    it('default env', done => {

      gconf_instance.registerModifier('env');

      var conf = JSON.parse(JSON.stringify(base_config));

      gconf_instance.provider = {
        request: (env, path) => {
          if(path){
            return _.get(conf, path);
          }
          return conf;
        }
      };

      let basic_mod = 'barrrr';
      let complex_mod = {
        bar: 2001,
        space: 'odyssey'
      };

      process.env.GCONF_foo = basic_mod;
      process.env.GCONF_complex_foo = JSON.stringify(complex_mod);

      assert.equal(gconf_instance.request('default').foo, basic_mod, 'without selector');
      assert.equal(gconf_instance.request('default', 'foo'), basic_mod, 'with selector');
      
      assert.deepEqual(gconf_instance.request('default').complex.foo, complex_mod, 'complex with selector');
      assert.deepEqual(gconf_instance.request('default', 'complex.foo'), complex_mod, 'complex with selector');

      done();
    });
  });

  describe('argv modifier', () => {
    const base_config = {
      foo: 'bar',
      complex: {
        foo: {
          bar: 2000
        }
      }
    };

    before(() => {
      var base_argv = process.argv;
      Object.defineProperty(process, 'argv', {
        get: () => {
          return [
            base_argv[0],
            base_argv[1],
            '--foo=barr',
            '--complex.foo.bar=100'
          ];
        }
      });

      require('yargs').parse(process.argv);
    });

    it('basic use', () => {
      gconf_instance.registerModifier('argv');

      var conf = JSON.parse(JSON.stringify(base_config));

      gconf_instance.provider = {
        request: (env, path) => {
          if(path){
            return _.get(conf, path);
          }
          return conf;
        }
      };

      assert.equal(gconf_instance.request('default').foo, 'barr', 'without selector');
      assert.equal(gconf_instance.request('default', 'foo'), 'barr', 'with selector');
      
      assert.equal(gconf_instance.request('default').complex.foo.bar, 100, 'complex with selector');
      assert.equal(gconf_instance.request('default', 'complex.foo.bar'), 100, 'complex with selector');
    });

    it('whitelist', () => {

      gconf_instance.registerModifier('argv', {
        whitelist:['foo']
      });

      var conf = JSON.parse(JSON.stringify(base_config));

      gconf_instance.provider = {
        request: (env, path) => {
          if(path){
            return _.get(conf, path);
          }
          return conf;
        }
      };

      assert.equal(gconf_instance.request('default', 'foo'), 'barr', 'with selector');

      assert.equal(gconf_instance.request('default', 'complex.foo.bar'), conf.complex.foo.bar, 'complex with selector');
    });

  });

  describe('singleton', () => {

    before(() => {

      var base_config = {
        default: {
          foo: 'bar',
          test: true
        }
      };

      require('./index').load(base_config);
    });

    it('singleton loaded', done => {

      var gconf = require('./index');

      assert.isDefined(gconf.instance, 'instance defined');
      assert.isNotNull(gconf.instance, 'instance not null');

      done();
    });
  });

  describe('file provider', () => {

    before(() => {
      mock_fs({
        '/arse/': {
          'config.dev.yaml': YAML.stringify({ foo: 'bar' }),
          'config.prod.json': JSON.stringify({ foo: 'bar' })
        }
      });
    });

    it('loading files', () => {
      gconf_instance.registerProvider('file', {
        dev: {
          path: '/arse/config.dev.yaml'
        },
        prod: {
          path: '/arse/config.prod.json'
        }
      });

      assert.deepEqual(gconf_instance.request('dev'), { foo: 'bar' });
      assert.equal(gconf_instance.request('dev', 'foo'), 'bar');
      assert.deepEqual(gconf_instance.request('prod'), { foo: 'bar' });
      assert.equal(gconf_instance.request('prod', 'foo'), 'bar');
    });

    it('default domain', () => {
      gconf_instance.registerProvider('file', '/arse/config.dev.yaml');

      assert.deepEqual(gconf_instance.request(), { foo: 'bar' });
    });

    it('changing files', () => {

      gconf_instance.registerProvider('file', {
        dev: {
          path: '/arse/config.dev.yaml'
        }
      });

      assert.equal(gconf_instance.request('dev', 'foo'), 'bar');

      mock_fs({
        '/arse/': {
          'config.dev.yaml': YAML.stringify({ foo: 'bar2000' }),
        }
      });

      setTimeout(function() {
        assert.equal(gconf_instance.request('dev', 'foo'), 'bar2000');
      }, 1000);

    });
    
    after(() => {
      mock_fs.restore();
    });
  });

  describe('pluggin in components', () => {

    it('creating a provider', () => {

      let Provider = require('./lib/components/provider');

      class FooProvider extends Provider{
        request(env, path) {
          return 'bar';
        }
      }

      gconf.components.registerProvider('foo', FooProvider);

      gconf_instance.registerProvider('foo');

      assert.equal(gconf_instance.request(), 'bar');
    });

    it('creating a modifier', () => {

      let Modifier = require('./lib/components/modifier');

      class BarModifier extends Modifier{
        
        modify(config) {
          return 'foo';
        }

      }

      gconf.components.registerModifier('bar', BarModifier);

      gconf_instance.registerProvider('memory', {
        default: 'arse'
      });
      gconf_instance.registerModifier('bar');

      assert.equal(gconf_instance.request(), 'foo');
    });

  });

  describe('defult domain', () => {

    const base_config = {
      foo: {
        bar: 2000
      }
    };

    it('should select default domain', () => {

      var conf = JSON.parse(JSON.stringify(base_config));

      gconf_instance.provider = {
        request: (env, path) => {
          if(path){
            return _.get(conf, path);
          }
          return conf;
        }
      };

      assert.deepEqual(gconf_instance.default.request(), base_config, 'selected with default');
      assert.deepEqual(gconf_instance.request(), base_config, 'selected without default');
      
      assert.equal(gconf_instance.default.request('foo.bar'), base_config.foo.bar, 'selected with default and path');

    });

  });

  describe('.gconfrc tests', () => {

    function load_rc_settings(settings){
      var moch_config = {};
      var config_path = path.join(process.cwd(), '.gconfrc');

      moch_config[config_path] = JSON.stringify(settings);

      mock_fs(moch_config);
    }

    const rc_settings = {
      config: {
        memory: {},
        gconf: {
          default_domain: 'dev'
        }
      }
    };

    before(() => {
      load_rc_settings(rc_settings);
    });

    it('the correct config loaded', ()=>{
      require('./lib/rcloader').forceReload();

      let MemoryProvider = require('./lib/components/providers/memory');
      assert.instanceOf(gconf.instance.provider, MemoryProvider);
    });

    it('meta settings changed', () => {
      require('./lib/rcloader').forceReload();

      expect(gconf.instance.meta.default_domain).to.equal(rc_settings.config.gconf.default_domain);
    });

    it('fail non existant plugin', () => {

      load_rc_settings({
        plugins: ['sometesting']
      });

      expect(require('./lib/rcloader').forceReload).to.throw(Error);
    });

    after(() => {
      mock_fs.restore();
    });
  });

  describe('request many', () => {

    var complex_config = {
      foo: 2000,
      bar: {
        the: 'best'
      }
    };

    it('return many values', () => {

      gconf_instance.registerProvider('memory', {
        default: JSON.parse(JSON.stringify(complex_config))
      });

      var result_array = [
        complex_config.foo,
        complex_config.bar,
        complex_config.bar.the
      ];

      assert.deepEqual(gconf_instance.requestMany('default', ['foo', 'bar', 'bar.the']), result_array, 'With default as parameter');
      assert.deepEqual(gconf_instance.default.requestMany(['foo', 'bar', 'bar.the']), result_array, 'With default inline param');
    });

    it('check spread', () => {

      gconf_instance.registerProvider('memory', {
        default: JSON.parse(JSON.stringify(complex_config))
      });

      function checkSpread(foo, bar, bar_the){
        assert.equal(foo, complex_config.foo, 'foo');
        assert.deepEqual(bar, complex_config.bar, 'bar');
        assert.equal(bar_the, complex_config.bar.the, 'bar.the');
      }

      checkSpread(...gconf_instance.default.requestMany(['foo', 'bar', 'bar.the']));
    });

  });

});

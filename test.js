
const sinon = require('sinon');
const chai = require('chai');
const assert = chai.assert;

const GConf = require('./index').GConf;

describe('core gconf functionality', () => {

  var gconf_instance;

  beforeEach(() => {
    gconf_instance = new GConf();
  });

  it('load provider', done => {

    let MemoryProvider = require('./lib/providers/memory');

    gconf_instance.registerProvider('memory');

    assert.instanceOf(gconf_instance.provider, MemoryProvider);

    done();
  });

  it('load modifiers', done => {

    let EnvModifier = require('./lib/modifiers/env');

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
          fo: 'oo'
        }
      };

    it('no provider fail', done => {

      assert.throws(gconf_instance.request.bind(gconf_instance));

      done();
    });

    it('env selection', done => {

      gconf_instance.registerProvider('memory', base_config);

      let dev_config = gconf_instance.request('dev');

      assert.deepEqual(dev_config, { foo: 'bar' });

      let prod_config = gconf_instance.request('prod');
      assert.deepEqual(prod_config, { foo: 'bar2000' });

      done();

    });

    it('path selection', done => {
      
      gconf_instance.registerProvider('memory', base_config);

      assert.equal(gconf_instance.request('dev', 'foo'), 'bar');
      assert.equal(gconf_instance.request('test', 'foo.bar'), 2000);

      done();

    });

    it('default env selection', done => {
      
      gconf_instance.registerProvider('memory', base_config);

      assert.deepEqual(gconf_instance.request(), base_config.default);

      done();

    });

  });

  describe('env modifier', () => {
    var base_config = {
      foo: 'bar',
      complex: {
        foo: {
          bar: 2000
        }
      }
    };

    it('default env', done => {

      gconf_instance.registerModifier('env');

      gconf_instance.provider = {
        request: sinon.stub().returns(base_config)
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
});

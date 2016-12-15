
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
        }
      };

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

  });

});

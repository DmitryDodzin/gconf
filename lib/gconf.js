/* jshint -W138 */

const _ = require('lodash');
const component_factory = require('./components/factory');

class GConf{

  constructor(options){
    this.modifier_queue = [];
    this.provider = null;
    this.meta = {
      default_domain: 'default',
      node_env: false
    };

    if(options){
      this._registerOptions(options);

      var meta_settings = options.gconf || {};
      Object.assign(this.meta, meta_settings);
    }

    Object.seal(this);
  }

  get default_domain(){
    if(this.meta.node_env)
      return process.env.NODE_ENV || this.meta.default_domain;
    return this.meta.default_domain;
  }

  _registerOptions(options){
    let wrapped = _(Object.keys(options));

    let providers = wrapped.intersection(component_factory.PROVIDERS);
    let modifiers = wrapped.intersection(component_factory.MODIFIERS);

    if(providers.size() > 1){
      throw new Error('There can be only one provider currently');
    } else if(providers.size() == 1){
      let provider = providers.first();
      this.registerProvider(provider, options[provider]);
    }

    modifiers.forEach((modifier) => 
      this.registerModifier(modifier, options[modifier]));
  }

  registerProvider(provider, options){
    this.provider = component_factory.createProvider(provider, options);
  }

  registerModifier(modifier, options){
    let modifier_instance = component_factory.createModifier(modifier, options);
    this.modifier_queue.push(modifier_instance);
  } 
  
  get default(){
    return{
      get: this.request.bind(this, this.meta.default_domain),
      request: this.request.bind(this, this.meta.default_domain),
      requestMany: this.requestMany.bind(this, this.meta.default_domain)
    };
  }

  checkBeforeRequest(){
    if(!this.provider){
      throw new Error('No provider was registered');
    }
  }

  get(domain, location){
    if(location && Array.isArray(location)){
      return this.requestMany(domain, location);
    } else {
      return this.request(domain, location);
    }
  }

  request(domain, path){
    domain = domain || this.default_domain;
    this.checkBeforeRequest();
    let baseConfig = this.provider.request(domain, path);
    this.modifier_queue.forEach((modifier) => {
      baseConfig = modifier.modify(baseConfig, path);
    });
    return baseConfig;
  }

  requestMany(domain, paths){
    this.checkBeforeRequest();
    var configs = this.provider.requestMany(domain, paths);

    return configs.map((config, index) => {
      this.modifier_queue.forEach(modifier => {
        config = modifier.modify(config, paths[index]);
      });
      return config;
    });
  }
}

module.exports = GConf;
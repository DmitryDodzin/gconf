
const _ = require('lodash');
const component_factory = require('./components/factory');

class GConf{

  constructor(options){
    this.modifier_queue = [];
    this.provider = null;

    if(options){
      this._registerOptions(options);
    }

    Object.seal(this);
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

  request(domain, path){
    if(!this.provider){
      throw new Error('No provider was registered');
    }
    let baseConfig = this.provider.request(domain, path);
    this.modifier_queue.forEach((modifier) => {
      baseConfig = modifier.modify(baseConfig, path);
    });
    return baseConfig;
  }
}

module.exports = GConf;
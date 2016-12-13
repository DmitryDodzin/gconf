
const _ = require('lodash');

const PROVIDERS = ['memory'];
const MODIFIERS = ['env'];

class GConf{

  constructor(options){
    this.modifier_queue = [];

    if(options){
      this._registerOptions(options);
    }
  }

  _registerOptions(options){
    let wrapped = _(Object.keys(options));

    let providers = wrapped.intersection(PROVIDERS);
    let modifiers = wrapped.intersection(MODIFIERS);

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
    let Provider = require('./providers/' + provider);
    this.provider = new Provider(options);
  }

  registerModifier(modifier, options){
    let Modifier = require('./modifiers/' + modifier);
    this.modifier_queue.push(new Modifier(options));
  } 

  request(env, path){
    if(!this.provider){
      throw new Error('No provider was registered');
    }
    let baseConfig = this.provider.request(env, path);
    this.modifier_queue.forEach((modifier) => {
      baseConfig = modifier.modify(baseConfig, path);
    });
    return baseConfig;
  }
}

module.exports = GConf;
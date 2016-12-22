
const _ = require('lodash');
const Modifier = require('../modifier');

const DEFAULTS = {
  prefix: 'GCONF',
  splitter: '_'
};

class EnvModifier extends Modifier{

  constructor(options) {
    super();
    this.options = _.merge(DEFAULTS, options);
  }

  modify(config, path){
    let env_prefix = this.options.prefix + this.options.splitter;

    if(path){
      var rootConfig = {};
      _.set(rootConfig, path, config);
      config = rootConfig;
    }

    let config_keys = Object.keys(process.env)
      .filter((key) => key.indexOf(env_prefix) === 0);

    config_keys.forEach((key) => {
      let env_path = key.substring(env_prefix.length)
        .replace(this.options.splitter, '.');

      try{
        _.set(config, env_path, JSON.parse(process.env[key]));
      }
      catch(e){
        _.set(config, env_path, process.env[key]);
      }
    });

    if(path){
      config = _.get(config, path);
    }
    return super.modify(config);
  }
}

module.exports = EnvModifier;

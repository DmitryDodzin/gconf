
const _ = require('lodash');
const Provider = require('../provider');
const Immutable = require('immutable');

class MemoryProvider extends Provider{

  constructor(options){
    super(options);

    this.options = Immutable.Map(options);
  }

  request(env, path){
    if(this.options.has(env)){
      let domain = this.options.get(env); 
      if(path){
        return _.get(domain, path);
      }
      return domain;
    } else {
      throw new Error('Env is not in config');
    }
  }
}

module.exports = MemoryProvider;

const componet_factory = require('./factory');

class Provider{

  constructor(options) {
    if('fallback' in options){
      this.fallback = componet_factory.createProvider(options.fallback.type, options.fallback.options);
    }
  }

  request(env, path) {
    if(this.fallback){
      return this.fallback.request(env, path);
    }
  }
}

module.exports = Provider;

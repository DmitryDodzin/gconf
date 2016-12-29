const componet_factory = require('./factory');

class Provider{

  request(env, path) {
    if(this.fallback){
      return this.fallback.request(env, path);
    }
  }
}

module.exports = Provider;

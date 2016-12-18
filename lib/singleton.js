const GConf = require('./gconf');

class ConfigSingleton{
  constructor() {
    this._defineProperties();
  }

  _defineProperties(){
    Object.defineProperty(this, 'instance', {
      get: () => this._instance
    });
  }

  loadConfig(options){
    if(options instanceof GConf){
      this._instance = options;
    } else {
      this._instance = new GConf(options);
    }
  }
}

module.exports = new ConfigSingleton();
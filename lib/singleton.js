const GConf = require('./gconf');

class ConfigSingleton{

  get instance(){
    return this._instance;
  }

  loadConfig(options){
    if('warn' in console)
      console.warn('Function is depricated use "load" instead');
    else
      console.log('Function is depricated use "load" instead');
    this.load(options);
  }

  load(options){
    if(options instanceof GConf){
      this._instance = options;
    } else {
      this._instance = new GConf(options);
    }
  }
}

module.exports = new ConfigSingleton();
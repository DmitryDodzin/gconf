
const fs = require('fs');
const _ = require('lodash');
const path = require('path');
const YAML = require('yamljs');
const Provider = require('../provider');

class FileProvider extends Provider{

  constructor(options) {
    super();
    var _this = this;

    this.options = {};

    Object.keys(options).forEach(env => {
      var option = options[env];
      _this.loadFile(env, option.path);
      if(option.watch){
        _this.watchFile(env, option.path);
      }
    });

    Object.seal(this);
  }

  loadFile(env, config_path){
    switch(path.extname(config_path)){
      case '.json':
        var content = fs.readFileSync(config_path);
        this.options[env] = JSON.parse(content);
        break;
      case '.yaml':
        this.options[env] = YAML.load(config_path);
        break;
      default:
        throw new Error('Unknow file type of ' + config_path);
    }
  }

  watchFile(env, config_path){
    var _this = this;
    fs.watch(config_path, () => {
      _this.loadFile(env, config_path);
    });
  }

  request(env, path){
    if(env in this.options){
      if(path){
        return _.get(this.options[env], path);
      } else {
        return this.option[env];
      }
    } else {
      throw new Error('Env is not in config');
    }
  }

}

module.exports = FileProvider;
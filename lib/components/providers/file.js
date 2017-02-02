
const fs = require('fs');
const _ = require('lodash');
const path = require('path');
const YAML = require('yamljs');
const Provider = require('../provider');

class FileProvider extends Provider{

  constructor(options) {
    super(options);

    this.options = {};

    if(typeof options == 'string'){
      this.loadFile('default', options);
    } else {
      Object.keys(options).forEach(env => {
        var option = options[env];
        if(typeof option == 'string'){
          this.loadFile(env, option);
        } else {
          this.loadFile(env, option.path);
          if(option.watch){
            this.watchFile(env, option.path);
          }
        }
      });  
    }

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
        return this.options[env];
      }
    } else {
      throw new Error('Env is not in config');
    }
  }

}

module.exports = FileProvider;
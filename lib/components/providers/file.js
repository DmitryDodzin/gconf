
const fs = require('fs');
const _ = require('lodash');
const path = require('path');
const YAML = require('yamljs');
const Immutable = require('immutable');
const Provider = require('../provider');

class FileProvider extends Provider{

  constructor(options) {
    super(options);

    this.options = Immutable.Map({});

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

  loadFile(env, config_path, isAsync=false){
    switch(path.extname(config_path)){
      case '.json':
        if(isAsync){
          fs.readFile(config_path, (err, content) => {
            if(err)
              throw err;
            this.options = this.options.set(env, JSON.parse(content));  
          });
        } else {
          var content = fs.readFileSync(config_path);
          this.options = this.options.set(env, JSON.parse(content));  
        }
        break;
      case '.yaml':
        if(isAsync){
          YAML.parseFile(config_path, (content) => {
            this.options = this.options.set(env, content);
          });
        } else {
          this.options = this.options.set(env, YAML.load(config_path));
        }
        break;
      default:
        throw new Error('Unknow file type of ' + config_path);
    }
  }

  watchFile(env, config_path){
    var _this = this;
    fs.watch(config_path, () => 
      _this.loadFile(env, config_path, true)
    );
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

module.exports = FileProvider;
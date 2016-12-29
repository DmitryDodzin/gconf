
const _ = require('lodash');
const yargs = require('yargs');
const Modifier = require('../modifier');

const DEFAULTS = {
  blacklist: ['_', '$0']
};

class ArgvModifier extends Modifier{

  constructor(options) {
    super();
    this.argv = yargs.argv;
    this.options = _.merge(DEFAULTS, options);

    this.generateModifyObject();    
  }

  generateModifyObject(){
    this.modifyObject = {};
    let modifyKeys = [];

    if('whitelist' in this.options){
      let whitelist = this.options.whitelist;
      modifyKeys = _.intersection(Object.keys(this.argv), whitelist);
    } else {
      modifyKeys = Object.keys(this.argv);
    }
    modifyKeys = _.difference(modifyKeys, this.options.blacklist);

    modifyKeys.forEach(key => {
      _.set(this.modifyObject, key, this.argv[key]);
    });
  }

  modify(config, path){

    let rootConfig = {};
    if(path){
      _.set(rootConfig, path, config);
    } else {
      rootConfig = config;
    }

    _.merge(rootConfig, this.modifyObject);

    if(path){
      return super.modify(_.get(rootConfig, path));
    } else {
      return super.modify(rootConfig);
    }
  }
}

module.exports = ArgvModifier;
/* jshint -W138 */

const _ = require('lodash');
const Provider = require('../provider');

class MemoryProvider extends Provider{

  constructor(options){
    super();

    this.options = _.merge({}, options);
  }

  request(env = 'default', path){
    if(env in this.options){
      if(path){
        if(_.isArray(path)){
          path = _.union([env], path);
        } else {
          path = env + '.' + path;
        }
      } else {
        path = env;
      }
      return _.get(this.options, path);
    } else {
      throw new Error('Env is not in config');
    }
  }
}

module.exports = MemoryProvider;

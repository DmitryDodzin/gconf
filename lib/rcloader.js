const fs = require('fs');
const path = require('path');
const singleton = require('./singleton');

function init(){
  var basedir = process.cwd();
  var rc_path = path.join(basedir, '.gconfrc'); 

  if(fs.existsSync(rc_path)){

    var rc_settings = JSON.parse(fs.readFileSync(rc_path));

    if('plugins' in rc_settings && Array.isArray(rc_settings.plugins)){
      rc_settings.plugins.forEach(plugin => require(plugin));
    }

    if('config' in rc_settings){
      singleton.load(rc_settings.config);
    }
    
  }  
}

init();

module.exports = {
  forceReload: init
};
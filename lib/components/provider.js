const componet_factory = require('./factory');

class Provider{

  request(domain, path) {
  }

  requestMany(domain, paths) {
    if(!Array.isArray(paths)){
      throw new Error('Paths must be sent and should be an Array');
    }
    return paths.map(path => this.request(domain, path));
  }
}

module.exports = Provider;

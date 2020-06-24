const driver = require('../driver');

class Driver extends driver.Driver {
  static get name() {
    return 'neo4j';
  }

  connect(credentials) {

  }

  disconnect(credentials) {
    
  }
}

module.exports = {
  Driver,
}

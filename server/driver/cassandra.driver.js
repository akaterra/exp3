const driver = require('../driver');

class Driver extends driver.Driver {
  static get alias() {
    return 'cassandra';
  }

  connect(credentials) {

  }

  disconnect(credentials) {
    
  }
}

module.exports = {
  Driver,
}

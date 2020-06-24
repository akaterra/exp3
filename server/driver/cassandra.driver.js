const driver = require('../driver');

class Driver extends driver.Driver {
  static get name() {
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

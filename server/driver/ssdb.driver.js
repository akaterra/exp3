const driver = require('../driver');

class Driver extends driver.Driver {
  static get alias() {
    return 'ssdb';
  }

  connect(credentials) {

  }

  disconnect(credentials) {
    
  }
}

module.exports = {
  Driver,
}

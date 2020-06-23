const driver = require('../driver');

class Driver extends driver.Driver {
  static get alias() {
    return 'simpledb';
  }

  connect(credentials) {

  }

  disconnect(credentials) {
    
  }
}

module.exports = {
  Driver,
}

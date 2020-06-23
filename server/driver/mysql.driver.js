const driver = require('../driver');

class Driver extends driver.Driver {
  static get alias() {
    return 'mysql';
  }

  connect(credentials) {

  }

  disconnect(credentials) {
    
  }
}

module.exports = {
  Driver,
}

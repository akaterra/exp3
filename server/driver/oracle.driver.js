const driver = require('../driver');

class Driver extends driver.Driver {
  static get alias() {
    return 'oracle';
  }

  connect(credentials) {

  }

  disconnect(credentials) {
    
  }
}

module.exports = {
  Driver,
}

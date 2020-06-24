const driver = require('../driver');

class Driver extends driver.Driver {
  static get name() {
    return 'firebird';
  }

  connect(credentials) {

  }

  disconnect(credentials) {
    
  }
}

module.exports = {
  Driver,
}

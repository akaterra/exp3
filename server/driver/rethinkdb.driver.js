const driver = require('../driver');

class Driver extends driver.Driver {
  static get name() {
    return 'rethinkdb';
  }

  connect(credentials) {

  }

  disconnect(credentials) {
    
  }
}

module.exports = {
  Driver,
}

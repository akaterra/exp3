const driver = require('../driver');

class Driver extends driver.Driver {
  static get name() {
    return 'tarantool';
  }

  connect(credentials) {

  }

  disconnect(credentials) {
    
  }
}

module.exports = {
  Driver,
}

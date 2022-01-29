const BaseAdapter = require('../adapter').Adapter;

class Adapter extends BaseAdapter {
  get alias() {
    return this._alias ?? 'selenium';
  }

  get universe() {
    return 'web';
  }
}

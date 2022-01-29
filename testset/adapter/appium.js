const BaseAdapter = require('../adapter').Adapter;

class Adapter extends BaseAdapter {
  get alias() {
    return this._alias ?? 'appium';
  }

  get universe() {
    return 'mobile';
  }
}

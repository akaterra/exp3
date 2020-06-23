class Driver {
  static get alias() {
    throw new 'Alias is not defined';
  }

  static get features() {
    return {};
  }

  get dbManager() {
    if (!this._dbManager) {
      this._dbManager = new (this.dbManagerClass)(this);
    }

    return this._dbManager;
  }

  get dbManagerClass() {
    throw new Error('Db manager is not defined');
  }

  get state() {
    return {};
  }

  constructor(connectionName) {
    this._descriptor = { connectionName };
  }

  toJSON() {
    return {
      dbs: Object.fromEntries(this.dbManager.dbs),
      descriptor: this._descriptor,
    };
  }
}

module.exports = {
  Driver,
};

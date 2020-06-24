class Driver {
  static get features() {
    return {};
  }

  static get name() {
    throw new 'Name is not defined';
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
      driver: {
        features: this.features,
        name: this.name,
      },
      name: this._descriptor.connectionName,
    };
  }
}

module.exports = {
  Driver,
};

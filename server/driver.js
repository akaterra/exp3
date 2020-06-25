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
        features: Object.getPrototypeOf(this).constructor.features,
        name: Object.getPrototypeOf(this).constructor.name,
      },
      name: this._descriptor.connectionName,
    };
  }
}

module.exports = {
  Driver,
};

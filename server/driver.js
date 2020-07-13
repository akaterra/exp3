class Driver {
  static get displayName() {
    this.name;
  }

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

  getNested(dbName, schameName, sourceName) {
    let sub = this.dbManager.get(dbName);

    if (schameName) {
      sub = sub.schemaManager.get(schameName);
    }

    if (sourceName) {
      sub = sub.sourceManager.get(sourceName);
    }

    return sub;
  }

  toJSON() {
    return {
      dbs: Object.fromEntries(this.dbManager.dbs),
      descriptor: this._descriptor,
      driver: {
        displayName: Object.getPrototypeOf(this).constructor.displayName,
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

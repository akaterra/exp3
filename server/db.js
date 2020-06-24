const manager = require('./manager');
const ROOT = '__ROOT__';

class Db extends manager.WithDescriptor {
  get client() {
    return this.connect().then((db) => db._client);
  }

  get credentials() {
    return this._credentials || {};
  }

  get driver() {
    return this._parent.parent;
  }

  get isConnected() {
    return this._isConnected || false;
  }

  get name() {
    return this._name;
  }

  get nodeType() {
    return 'db';
  }

  get schemaManager() {
    if (!this._schemaManager) {
      this._schemaManager = new (this.schemaManagerClass)(this);
    }

    return this._schemaManager;
  }

  get schemaManagerClass() {
    throw new Error('Schema manager reference is not defined');
  }

  constructor(name, parent) {
    super();

    this._name = name;
    this._parent = parent;
  }

  setCredentials(credentials) {
    this._credentials = credentials;

    return this;
  }

  connect(credentials) {

  }
  
  disconnect() {

  }

  delete() {

  }

  toJSON() {
    return {
      descriptor: this._descriptor,
      isConnected: this.isConnected,
      name: this.name,
      schemas: Object.fromEntries(this.schemaManager.entities),
    };
  }
}

//
// db manager
//

class DbManager extends manager.Manager {
  get client() {
    return this.get(ROOT).connect().then((db) => db.client);
  }

  get credentials() {
    return this._credentials || {};
  }

  get dbClass() {
    throw new Error('Db reference is not defined');
  }

  get dbs() {
    return this._entities;
  }

  get nodeType() {
    return 'dbManager';
  }

  setCredentials(credentials) {
    this._credentials = credentials;

    return this;
  }

  async connect(credentials) {
    this._credentials = credentials || this._credentials;

    if (!this.has(ROOT)) { // default db
      this.set(ROOT, new (this.dbClass)(ROOT, this.parent));
    }

    for (const db of this._entities.values()) {
      await db.setCredentials(db.name !== ROOT ? { ...credentials, name: db.name } : credentials).connect();
    }

    return this;
  }
  
  async disconnect() {
    for (const db of this._entities.values()) {
      await db.disconnect();
    }

    return this;
  }

  toJSON() {
    return {
      descriptor: this._descriptor,
      dbs: Object.fromEntries(this._entities),
    };
  }
}

module.exports = {
  Db,
  DbManager,
  ROOT,
};

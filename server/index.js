const manager = require('./manager');

class Index extends manager.WithDescriptor {
  get client() {
    return this._parent.client;
  }

  get db() {
    return this.table.schema.db;
  }

  get name() {
    return this._name;
  }

  get nodeType() {
    return 'index';
  }

  get table() {
    return this._parent.parent;
  }

  constructor(name, parent) {
    super();

    this._name = name;
    this._parent = parent;
  }
  
  delete() {

  }

  toJSON() {
    return {
      descriptor: this._descriptor,
      name: this.name,
    };
  }
}

//
// index manager
//

class IndexManager extends manager.Manager {
  get indexes() {
    return this._entities;
  }

  get nodeType() {
    return 'indexManager';
  }

  toJSON() {
    return {
      descriptor: this._descriptor,
      tables: Object.fromEntries(this._entities),
    };
  }
}

module.exports = {
  Column: require('./column').Column,
  ColumnManager: require('./column').ColumnManager,
  connectionManager: require('./manager').connectionManager,
  ConnectionManager: require('./manager').ConnectionManager,
  Db: require('./db').Db,
  DbManager: require('./db').DbManager,
  Driver: require('./driver').Driver,
  Index,
  IndexManager,
  Manager: require('./manager').Manager,
  Schema: require('./schema').Schema,
  SchemaManager: require('./schema').SchemaManager,
  Source: require('./source').Source,
  SourceManager: require('./source').SourceManager,
  ROOT: require('./db').ROOT,
};

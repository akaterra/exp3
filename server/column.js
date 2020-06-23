const manager = require('./manager');

class Column extends manager.WithDescriptor {
  get client() {
    return this._parent.client;
  }

  get db() {
    return this.table.schema.db;
  }

  get name() {
    return this._name;
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
// column manager
//

class ColumnManager extends manager.Manager {
  get db() {
    return this.table.db;
  }

  get table() {
    return this._parent;
  }

  get columns() {
    return this._entities;
  }

  toJSON() {
    return {
      descriptor: this._descriptor,
      columns: Object.fromEntries(this._entities),
    };
  }
}

module.exports = {
  Column,
  ColumnManager,
};

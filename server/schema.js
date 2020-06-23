const manager = require('./manager');

class Schema extends manager.WithDescriptor {
  get client() {
    return this._parent.client;
  }

  get db() {
    return this._parent.parent;
  }

  get name() {
    return this._name;
  }

  get sourceManager() {
    if (!this._sourceManager) {
      this._sourceManager = new (this.sourceManagerClass)(this);
    }

    return this._sourceManager;
  }

  get sourceManagerClass() {
    throw new Error('Schema manager reference is not defined');
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
      name: this.name,
      sources: Object.fromEntries(this.sourceManager.entities),
    };
  }
}

//
// schema manager
//

class SchemaManager extends manager.Manager {
  get schemaClass() {
    throw new Error('Schema reference is not defined');
  }

  get schemas() {
    return this._entities;
  }

  toJSON() {
    return {
      descriptor: this._descriptor,
      schemas: Object.fromEntries(this._entities),
    };
  }
}

module.exports = {
  Schema,
  SchemaManager,
};

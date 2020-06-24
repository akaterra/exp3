const manager = require('./manager');

class Source extends manager.WithDescriptor {
  get client() {
    return this._parent.client;
  }

  get nodeType() {
    return 'source';
  }

  get columnManager() {
    if (!this._columnManager) {
      this._columnManager = new (this.columnManagerClass)(this);
    }

    return this._columnManager;
  }

  get columnManagerClass() {
    throw new Error('Column manager reference is not defined');
  }

  get db() {
    return this.schema.db;
  }

  get indexManager() {
    if (!this._indexManager) {
      this._indexManager = new (this.indexManagerClass)(this);
    }

    return this._columnManager;
  }

  get indexManagerClass() {
    throw new Error('Index manager reference is not defined');
  }

  get name() {
    return this._name;
  }

  get schema() {
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
      columns: Object.fromEntries(this.columnManager.entities),
      descriptor: this._descriptor,
      indexes: Object.fromEntries(this.indexManager.entities),
      name: this.name,
    };
  }
}

//
// table manager
//

class SourceManager extends manager.Manager {
  get db() {
    return this.schema.db;
  }

  get nodeType() {
    return 'sourceManager';
  }

  get schema() {
    return this._parent;
  }

  get sources() {
    return this._entities;
  }

  describe() {
    return {};
  }

  toJSON() {
    return {
      descriptor: this._descriptor,
      sources: Object.fromEntries(this._entities),
    };
  }
}

module.exports = {
  Source,
  SourceManager,
};
class WithDescriptor {
  constructor(descriptor) {
    this._descriptor = descriptor || {};
  }

  assign(props) {
    Object.assign(this._descriptor, props);

    return this;
  }
}

class Manager extends WithDescriptor {
  get client() {
    return this._parent.client;
  }

  get entities() {
    return this._entities;
  }

  get parent() {
    return this._parent;
  }

  constructor(parent) {
    super();

    this._entities = new Map();
    this._parent = parent;
  }

  get(entity) {
    if (!entity) {
      entity = '__ROOT__';
    }

    if (this.has(entity)) {
      return this._entities.get(entity);
    }

    throw new Error(`Unknown entity "${entity}"`);
  }

  has(entity) {
    return this._entities.has(entity);
  }

  set(name, entity) {
    this._entities.set(name, entity);
  }

  create(entity) {

  }

  select() {

  }
}

module.exports = {
  Manager,
  WithDescriptor,
};

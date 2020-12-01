class Source {
  get name() {
    return this._name;
  }

  constructor(name, connectionOpts) {
    this._connectionOpts = connectionOpts;
    this._isConnected = false;
    this._name = name;
    this._sources = new Map();
  }

  asSource(source, customName) {
    const key = `${this._name}.${customName || source}`;

    if (!this._sources.has(key)) {
      this._sources.set(key, new (Object.getPrototypeOf(this).constructor)(
        `${this._name}.${customName || source}`,
        { ...this._connectionOpts, source },
      ));
    }
    
    return this._sources.get(key);
  }

  async connect() {
    if (this._isConnected) {
      return this;
    }

    await this.onConnect();

    this._isConnected = true;

    return this;
  }

  async select(query) {
    return [];
  }

  async selectIn(key, ids) {
    return this.select({ filter: { [key]: { $in: ids } } });
  }

  map(typ, val) {
    return val;
  }

  async onConnect() {
    
  }
}

module.exports = {
  Source,
};

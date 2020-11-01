class Source {
  get name() {
    return this._name;
  }

  constructor(name, connectionOpts) {
    this._connectionOpts = connectionOpts;
    this._isConnected = false;
    this._name = name;
  }

  asSource(source, customName) {
    return new (Object.getPrototypeOf(this).constructor)(
      `${this._name}.${customName || source}`,
      { ...this._connectionOpts, source },
    )
  }

  async connect() {
    if (this._isConnected) {
      return this;
    }

    await this.onConnect();

    this._isConnected = true;

    return this;
  }

  async query(query) {
    return [];
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

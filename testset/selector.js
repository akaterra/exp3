class Selector {
  constructor(session) {
    this._chain = [];
    this._session = session;
  }

  async run() {
    let lastResut;

    for (const link of this._chain) {
      lastResut = await link(lastResut);      
    }

    return lastResut;
  }

  then() {
    return this.run();
  }

  catch() {
    return this.run();
  }
}

module.exports = {
  Selector,
};

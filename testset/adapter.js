class Adapter {
  get alias() {
    return this._alias ?? 'unknown';
  }

  get universe() {
    return 'unknown';
  }

  async run(session) {
    if (!session.has(this.alias)) {
      const adaptesSession = await this.onRun(session);

      session.set(this.alias, adaptesSession).set(this.universe, adaptesSession);
    }

    return this;
  }

  terminate(session) {
    return this;
  }

  onRun(session) {
    return this;
  }

  onTerminate(session) {
    return this;
  }
}

module.exports = {
  Adapter,
};

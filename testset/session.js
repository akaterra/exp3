const v4 = require('uuid').v4;

class Session {
  get config() {
    return this._config ?? {};
  }

  get id() {
    return this._id;
  }

  constructor(config) {
    this._config = config;
    this._id = v4();
    this._sessions = new Map();
  }

  has(id) {
    return this._sessions.has(id);
  }

  set(alias, session) {
    this._sessions.set(alias, this[alias] = session);

    return this;
  }
}

module.exports = {
  Session,
};

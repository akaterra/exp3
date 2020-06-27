import { Observable, Subject } from 'rxjs';

class Streamable {
  constructor() {
    this._streams = new Map();
  }

  getStream(name) {
    if (!this._streams.has(name)) {
      this._streams.set(name, new Subject());
    }

    return this._streams.get(name);
  }
}

class Connection extends Streamable {
  get session() {
    return this._session || {};
  }

  get stream() {
    return this._stream;
  }

  async connect(credentials) {
    this._session = await this.execPost('/connection', credentials);

    return this._session;
  }

  async disconnect() {
    this._session = null;

    return this.delete(`/connection/${this._session.name}`);
  }

  async doCommand(db, command, parameters) {

  }

  selectDbs() {
    return wrapToStream(
      this.execGet(`/connection/${this._session.name}/db`),
      this.getStream('db'),
      'db:list',
    );
  }

  async selectSchemas(dbName) {
    return this.execGet(`/connection/${this._session.name}/db/${dbName}/schema`);
  }

  async selectSources(dbName, schemaName) {
    return this.execGet(`/connection/${this._session.name}/db/${dbName}/schema/${schemaName}/source`);
  }

  execGet(path) {
    return fetch(`http://127.0.0.1:9009${path}`, {
      method: 'GET',
      // body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json'
      },
    }).then((res) => res.status >= 200 && res.status < 300 ? res.json() : Promise.reject(res.status));
  }

  execPost(path, data) {
    return fetch(`http://127.0.0.1:9009${path}`, {
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json'
      },
    }).then((res) => res.status >= 200 && res.status < 300 ? res.json() : Promise.reject(res.status));
  }
}

class ConnectionManager extends Streamable {
  constructor() {
    super();

    this._connections = new Map();
  }

  get(connectionName) {
    const connection = this._connections.get(connectionName);

    if (!connection) {
      throw new Error(`Connection "${connectionName}" not exists`);
    }

    return connection;
  }

  has(connectionName) {
    return this._connections.has(connectionName);
  }

  set(connectionName, connection) {
    return this._connections.set(connectionName, connection);
  }

  async connect(credentials) {
    const connection = new Connection();

    await connection.connect(credentials);

    this.set(connection.session.name, connection);

    return connection;
  }

  selectDrivers() {
    return wrapToStream(
      this.execGet('/driver'),
      this.getStream('driver'),
      'driver:list',
    );
  }

  execGet(path) {
    return fetch(`http://127.0.0.1:9009${path}`, {
      method: 'GET',
      // body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json'
      },
    }).then((res) => res.status >= 200 && res.status < 300 ? res.json() : Promise.reject(res.status));
  }
}

function wrapToStream(promise, stream, event) {
  promise.then((data) => stream.next({ event, data }));

  return stream;
}

export const connectionManager = new ConnectionManager();

import { Streamable } from './streamable';

class Connection extends Streamable {
  get session() {
    return this._session || {};
  }

  get stream() {
    return this._stream;
  }

  constructor(session) {
    super();

    this._session = session;
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

  selectDbs(refresh) {
    const stream = this.getStream('db');

    return wrapToStream(
      this.execGet(`/connection/${this._session.name}/db`),
      stream,
      'db:list',
      refresh,
    );
  }

  selectSchemas(dbName, refresh) {
    const stream = this.getStream(`db/${dbName}/schema`);

    return wrapToStream(
      this.execGet(`/connection/${this._session.name}/db/${dbName}/schema`),
      stream,
      'schema:list',
      refresh,
    );
  }

  selectSources(dbName, schemaName, refresh) {
    const stream = this.getStream(`db/${dbName}/schema/${schemaName}/source`);

    return wrapToStream(
      this.execGet(`/connection/${this._session.name}/db/${dbName}/schema/${schemaName}/source`),
      stream,
      'source:list',
      refresh,
    );
  }

  sourceSelect(dbName, schemaName, sourceName, query, refresh) {
    const stream = this.getStream(`db/${dbName}/schema/${schemaName}/source/${sourceName}`);

    return wrapToStream(
      this.execPost(`/connection/${this._session.name}/db/${dbName}/schema/${schemaName}/source/${sourceName}`, query),
      stream,
      'source:select',
      refresh,
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

  createConnection(session) {
    const connection = new Connection(session);

    // await connection.connect(credentials);

    this.set(session.name, connection);

    return connection;
  }

  async connect(credentials) {
    const connection = new Connection();

    await connection.connect(credentials);

    this.set(connection.session.name, connection);

    return connection;
  }

  selectConnections() {
    return wrapToStream(
      this.execGet('/connection'),
      this.getStream('connection'),
      'connection:list',
    );
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

function wrapToStream(promise, stream, action) {
  promise.then((data) => {
    stream.next({ action, data });
  });

  return stream;
}

export const connectionManager = new ConnectionManager();

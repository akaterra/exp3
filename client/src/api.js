import { Observable, Subject } from 'rxjs';
import { take } from 'rxjs/operators';

class SubjectWithCache extends Subject {
  setCache(data) {
    this._data = data;

    for (const observer of this.observers) {
      observer.next(data);
    }

    return this;
  }

  subscribe(...args) {
    const subscription = super.subscribe(...args);

    if (this._data !== undefined) {
      subscription.next(this._data);
    }

    return subscription;
  }

  toImmediatePromise(resolveCached) {
    if (resolveCached && this._data !== undefined) {
      return Promise.resolve(this._data);
    }

    return this.pipe(take(1)).toPromise();
  }
}

class Streamable {
  constructor() {
    this._streams = new Map();
  }

  getStream(name) {
    if (!this._streams.has(name)) {
      this._streams.set(name, new SubjectWithCache());
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

function wrapToStream(promise, stream, action) {
  promise.then((data) => {
    if (stream instanceof SubjectWithCache) {
      stream.setCache({ action, data });
    } else {
      stream.next({ action, data });
    }
  });

  return stream;
}

export const connectionManager = new ConnectionManager();

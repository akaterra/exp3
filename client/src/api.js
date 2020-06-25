class Connection {
  get session() {
    return this._session || {};
  }

  async connect(credentials) {
    this._session = await this.post('/connection', credentials);

    return this._session;
  }

  async disconnect() {
    this._session = null;

    return this.delete(`/connection/${this._session.name}`);
  }

  async doCommand(db, command, parameters) {

  }

  async selectDbs() {
    return this.get('/db');
  }

  async selectSchemas(dbName) {
    return this.get(`/db/${dbName}/schema`);
  }

  async selectSources(dbName, schemaName) {
    return this.get(`/db/${dbName}/schema/${schemaName}/source`);
  }

  get(path) {
    return fetch(`http://127.0.0.1:9009${path}`, {
      method: 'GET',
      // body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json'
      },
    }).then((res) => res.status >= 200 && res.status < 300 ? res.json() : Promise.reject(res.status));
  }

  post(path, data) {
    return fetch(`http://127.0.0.1:9009${path}`, {
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json'
      },
    }).then((res) => res.status >= 200 && res.status < 300 ? res.json() : Promise.reject(res.status));
  }
}

class ConnectionManager {
  constructor() {
    this._connections = new Map();
  }

  get(connectionName) {
    return this._connections.get(connectionName);
  }

  has(connectionName) {
    return this._connections.has(connectionName);
  }

  async connect(credentials) {
    const connection = await new Connection().connect(credentials);

    this._connections.set(connection.name, connection);

    return connection;
  }

  async selectDrivers() {
    return this.get('/driver');
  }

  get(path) {
    return fetch(`http://127.0.0.1:9009${path}`, {
      method: 'GET',
      // body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json'
      },
    }).then((res) => res.status >= 200 && res.status < 300 ? res.json() : Promise.reject(res.status));
  }
}

export const connectionManager = new ConnectionManager();

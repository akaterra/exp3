const manager = require('./manager');

class ConnectionManager extends manager.Manager {
  constructor() {
    super();

    this._connectionId = 1;
    this._drivers = new Map();
  }

  async connect(connectionName, credentials) {
    if (!this.has(connectionName)) {
      if (!credentials.driver) {
        throw new Error(`Driver name required`);
      }

      if (!this.isDriverExists(credentials.driver)) {
        throw new Error(`Unknown driver "${credentials.driver}"`);
      }

      const connection = new (this._drivers.get(credentials.driver))(connectionName);
      await connection.dbManager.setCredentials(credentials).connect();

      this.set(connectionName, connection);
    }

    return this.get(connectionName);
  }

  async connectWithAutoId(credentials) {
    return await this.connect(`connection-${this._connectionId ++}`, credentials);
  }

  async disconnect(connectionName) {
    if (this.has(connectionName)) {
      await this.get(connectionName).dbManager.disconnect();
    }

    return this;
  }

  isDriverExists(driver) {
    return this._drivers.has(driver);
  }

  registerDriver(driver) {
    this._drivers.set(driver.name, driver);

    return this;
  }

  toJSON() {
    return {
      connections: Object.fromEntries(this._entities),
      drivers: [...this._drivers.values()].map((driver) => driver.name),
    }
  }
}

module.exports = {
  connectionManager: new ConnectionManager(),
  ConnectionManager,
};

class ConnectionManager {
  constructor() {
    this._connections = new Map();
    this._drivers = new Map();
  }

  async connect(connectionName, credentials) {
    if (!this.isExists(connectionName)) {
      if (!credentials.driver) {
        throw new Error(`Driver alias required`);
      }

      if (!this.isDriverExists(credentials.driver)) {
        throw new Error(`Unknown driver "${credentials.driver}"`);
      }

      const connection = new (this._drivers.get(credentials.driver))(connectionName);
      await connection.dbManager.setCredentials(credentials).connect();

      this._connections.set(connectionName, connection);
    }

    return this._connections.get(connectionName);
  }

  async disconnect(connectionName) {
    if (this.isExists(connectionName)) {
      await this.get(connectionName).dbManager.disconnect();
    }

    return this;
  }

  isDriverExists(driver) {
    return this._drivers.has(driver);
  }

  isExists(connectionName) {
    return this._connections.has(connectionName);
  }

  registerDriver(driver) {
    this._drivers.set(driver.alias, driver);

    return this;
  }
}

module.exports = {
  connectionManager: new ConnectionManager(),
  ConnectionManager,
};

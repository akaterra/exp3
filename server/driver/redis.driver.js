const _ = require('..');

class Db extends _.Db {
  get schemaManagerClass() {
    return SchemaManager;
  }

  async connect(credentials) {
    if (this.isConnected) {
      return this;
    }
    
    if (!credentials) {
      credentials = this.credentials;
    }

    this._isConnected = false;

    const asyncRedis = require("async-redis");

    const client = asyncRedis.createClient();

    if (credentials.password) {
      await client.auth(credentials.password);
    }

    this._client = client;
    this._isConnected = true;

    return this;
  }

  disconnect() {
    this._client = null;
    this._isConntected = false;

    return this;
  }
}

class DbManager extends _.DbManager {
  get dbClass() {
    return Db;
  }

  async select() {
    const client = await this.client;
    const res = await client.info('keyspace');

    res.split('\n').slice(1, -1).forEach((row) => {
      const [name, ...rest] = row.split(':');

      if (!this.has(name)) {
        this.set(name, new Db(name, this));
      }
  
      this.get(name).assign({
        records: parseInt(rest[0].split(',', 2)[0].split('=')[1]),
      });
    })

    return this._entities;
  }
}

class Schema extends _.Schema {
  get sourceManagerClass() {
    return SourceManager;
  }
}

class SchemaManager extends _.SchemaManager {
  get schemaClass() {
    return Schema;
  }

  async select() {
    return this._entities;
  }
}

class Source extends _.Source {
  get columnManagerClass() {
    return ColumnManager;
  }

  get indexManagerClass() {
    return IndexManager;
  }
}

class SourceManager extends _.SourceManager {
  get sourceClass() {
    return Source;
  }
  
  async select() {
    this.get(_.ROOT).assign({
      records: 0,
      type: 'kv',
    })

    return this._entities;
  }
}

class ColumnManager extends _.ColumnManager {

}

class IndexManager extends _.IndexManager {
  
}

class Driver extends _.Driver {
  static get name() {
    return 'redis';
  }

  get dbManagerClass() {
    return DbManager;
  }
}

module.exports = {
  Driver,
}

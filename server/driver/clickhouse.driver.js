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

    const { ClickHouse } = require('clickhouse');

    const client = new ClickHouse({
      url: credentials.host || 'http://127.0.0.1',
      port: credentials.port || 8123,

      basicAuth: credentials.password !== undefined ? {
        username: credentials.username || 'default',
        password: credentials.password,
      } : null,

      format: 'json',
    });

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
    const res = await client.query('SHOW DATABASES;').toPromise();

    if (!this.has(_.ROOT)) {
      this.set(_.ROOT, new Source(_.ROOT, this));
    }

    res.forEach((row) => {
      const name = row.name;

      if (!this.has(name)) {
        this.set(name, new Db(name, this));
      }
    });

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

  get features() {
    return {};
  }

  get indexManagerClass() {
    return IndexManager;
  }

  async select(query) {
    const { filter, limit, offset, sort, projection } = query;
    const client = await this.client;
    const res = await client.query(`SELECT * FROM ${this.db.name}.${this.name} LIMIT ${offset || 0}, ${limit || 20};`).toPromise();

    return {
      columns: Array.from(res.reduce((acc, doc) => {
        Object.keys(doc).forEach((key) => acc.add(key));

        return acc;
      }, new Set()).values()),
      result: res,
      totalCount: (await client.query(`SELECT count() AS total FROM ${this.db.name}.${this.name};`).toPromise())[0].total,
    };
  }
}

class SourceManager extends _.SourceManager {
  get sourceClass() {
    return Source;
  }

  async select() {
    if (!this.db.name !== _.ROOT) {
      const client = await this.client;
      const res = await client.query(`SHOW TABLES FROM ${this.db.name};`).toPromise();

      res.forEach((row) => {
        const name = row.name;

        if (!this.has(name)) {
          this.set(name, new (this.sourceClass)(name, this));
        }

        this.get(name).assign({
          size: 0,
          type: row.table_type === 'VIEW' ? 'view' : 'table',
        });
      });
    }

    return this._entities;
  }
}

class Column extends _.Column {

}

const COLUMN_TYPES = {
  from: {
    'String': 'string',
    'UInt8': 'uint8',
    'UInt64': 'uint64',
  },
  to: {
    'string': 'String',
    'uint8': 'UInt8',
    'uint64': 'UInt64',
  },
}

class ColumnManager extends _.ColumnManager {
  async select() {
    const client = await this.client;
    const res = await client.query(`DESCRIBE TABLE ${this.db.name}.${this.table.name} FORMAT JSON;`).toPromise();
    
    res.forEach((row) => {
      const name = row.name;

      if (!this.has(name)) {
        this.set(name, new Column(name, this));
      }

      this.get(name).assign({
        type: COLUMN_TYPES.from[row.type] || row.type,
      });
    });

    return this._entities;
  }
}

class IndexManager extends _.IndexManager {
  
}

class Driver extends _.Driver {
  static get name() {
    return 'clickhouse';
  }

  get dbManagerClass() {
    return DbManager;
  }
}

module.exports = {
  Driver,
}

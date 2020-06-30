const _ = require('..');
const ROOT = '__ROOT__';

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

    const { Client } = require('pg');

    const client = new Client({
      // connectionString: credentials.host || 'localhost:5432',
      host: credentials.host || 'localhost',
      port: credentials.port || 5432,

      user: credentials.username || (credentials.password ? 'postgres' : undefined),
      password: credentials.password,

      database: credentials.db || 'postgres',
    });

    await client.connect();

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
    const res = await client.query('SELECT datname FROM pg_database;');

    res.rows.forEach((row) => {
      const name = row.datname;

      if (!this.has(name)) {
        this.set(name, new Db(name, this).setCredentials({ ...this.credentials, db: name }));
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
    const client = await this.client;
    const res = await client.query(`SELECT nspname FROM pg_catalog.pg_namespace;`);

    res.rows.forEach((row) => {
      const name = row.nspname;

      if (!this.has(name)) {
        this.set(name, new Schema(name, this));
      }
    });

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
    const client = await this.client;
    const res = await client.query(`SELECT *, pg_relation_size(quote_ident(table_name)) FROM information_schema.tables WHERE table_schema = $1;`, [this.schema.name]);

    res.rows.forEach((row) => {
      const name = row.table_name;

      if (!this.has(name)) {
        this.set(name, new Source(name, this));
      }

      this.get(name).assign({
        size: parseInt(row.pg_relation_size),
        type: row.table_type === 'VIEW' ? 'view' : 'table',
      });
    });

    return this._entities;
  }
}

class ColumnManager extends _.ColumnManager {

}

class IndexManager extends _.IndexManager {
  
}

class Driver extends _.Driver {
  static get name() {
    return 'postgresql';
  }

  get dbManagerClass() {
    return DbManager;
  }
}

module.exports = {
  Driver,
}

const url = require('url');
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

    if (!credentials.host) {
      credentials.host = 'postgresql://127.0.0.1:5432';
    }

    if (credentials.host.substr(0, 13) !== 'postgresql://') {
      credentials.host = `postgresql://${credentials.host}`;
    }

    const uri = new URL(credentials.host);

    if (!uri.host) {
      uri.host = credentials.host || '127.0.0.1';
    }

    if (!uri.port) {
      uri.port = credentials.port || 5432;
    }

    if (!uri.schema) {
      uri.schema = 'postgresql://';
    }

    if (!uri.username && (credentials.username || credentials.password)) {
      uri.username = credentials.username || (credentials.password ? 'postgres' : undefined);
    }

    if (!uri.password && credentials.password) {
      uri.password = credentials.password;
    }

    if (!uri.pathname) {
      uri.pathname = `/${credentials.db || 'postgres'}`;
    }

    const client = new Client({
      connectionString: uri.toString(),
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

  async select(query) {
    const { filter, limit, offset, sort, projection } = query;
    const client = await this.client;
    const res = await client.query(`SELECT * FROM ${this.name} LIMIT $1 OFFSET $2;`, [limit || 20, offset || 0]);

    return {
      columns: res.fields.map((field) => field.name),
      result: res.rows,
      totalCount: (await client.query(`SELECT COUNT(1) AS total FROM ${this.name};`)).rows[0].total,
    };
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

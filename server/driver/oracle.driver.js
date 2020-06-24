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

    const oracledb = require('oracledb');

    const client = await oracledb.getConnection({
      connectString: `${credentials.host || 'localhost'}:${credentials.port || 1521}`,

      user: credentials.username || (credentials.password ? 'sysdba' : undefined),
      password: credentials.password,
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
    const res = await client.execute('SELECT NAME FROM v$database');
console.log(res)
    // res.rows.forEach((row) => {
    //   const name = row.datname;

    //   if (!this.has(name)) {
    //     this.set(name, new Db(name, this));
    //   }
    // });

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
    return 'oracle';
  }

  get dbManagerClass() {
    return DbManager;
  }
}

module.exports = {
  Driver,
}

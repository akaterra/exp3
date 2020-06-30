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

    const { MongoClient } = require('mongodb');

    const client = await MongoClient.connect(
      `mongodb://${credentials.host || '127.0.0.1'}:${credentials.port || 27017}`,
      {
        auth: credentials.password ? {
          user: credentials.username || 'guest',
          password: credentials.password,
        } : undefined,
        useUnifiedTopology: true,
      },
    );

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
    const res = await client.db('admin').admin().listDatabases();

    res.databases.forEach((row) => {
      const name = row.name;

      if (!this.has(name)) {
        this.set(name, new Db(name, this));
      }
  
      this.get(name).assign({
        size: row.sizeOnDisk ?? null,
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
    if (!this.db.name !== _.ROOT) {
      const client = await this.client;
      const res = await client.db(this.db.name).listCollections().toArray();
  
      res.forEach((row) => {
        const name = row.name;
  
        if (!this.has(name)) {
          this.set(name, new Source(name, this));
        }
    
        this.get(name).assign({
          size: row.sizeOnDisk ?? null,
          type: 'schemaless',
        });
      });
    }

    return this._entities;
  }
}

class Column extends _.Column {

}

class ColumnManager extends _.ColumnManager {
  async select() {
    if (!this.has('_id')) {
      this.set('_id', new Column(name, this));
    }

    this.get('_id').assign({
      type: 'unknown',
    });

    return this._entities;
  }
}

class Index extends _.Index {

}

class IndexManager extends _.IndexManager {
  
}

class Driver extends _.Driver {
  static get name() {
    return 'mongodb';
  }

  get dbManagerClass() {
    return DbManager;
  }
}

module.exports = {
  Driver,
}

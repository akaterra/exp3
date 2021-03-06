const url = require('url');
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

    if (!credentials.host) {
      credentials.host = 'mongodb://127.0.0.1:27017';
    }

    if (credentials.host.substr(0, 10) !== 'mongodb://' && credentials.host.substr(0, 14) !== 'mongodb+srv://') {
      credentials.host = `mongodb://${credentials.host}`;
    }

    const uri = new URL(credentials.host);

    if (!uri.host) {
      uri.host = credentials.host || '127.0.0.1';
    }

    if (!uri.port && credentials.port) {
      uri.port = credentials.port;
    }

    if (!uri.schema) {
      uri.schema = 'mongodb://';
    }

    if (!uri.username && (credentials.username || credentials.password)) {
      uri.username = credentials.username || (credentials.password ? 'guest' : undefined);
    }

    if (!uri.password && credentials.password) {
      uri.password = credentials.password;
    }

    if (!uri.pathname) {
      uri.pathname = `/${credentials.db || 'admin'}`;
    }

    const client = await MongoClient.connect(
      uri.toString(),
      {
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
        this.set(name, new Db(name, this).setClient(client).setIsConnected());
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

  get feature() {
    return {
      ...super.feature,
      extraType: [
        'mongo:id',
      ],
    };
  }

  get indexManagerClass() {
    return IndexManager;
  }

  async select(query) {
    const { filter, limit, offset, sort, projection } = query;
    const client = await this.client;
    const res = await client.db(this.db.name).collection(this.name).find().limit(limit || 20).skip(offset || 0).toArray();

    return {
      columns: Array.from(res.reduce((acc, doc) => {
        Object.keys(doc).forEach((key) => acc.add(key));

        return acc;
      }, new Set()).values()).sort(),
      result: res,
      totalCount: await client.db(this.db.name).collection(this.name).count(),
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

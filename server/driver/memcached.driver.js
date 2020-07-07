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

    const Memcached = require('memcached');

    if (!credentials.host) {
      credentials.host = '127.0.0.1:11211';
    }

    if (credentials.host.substr(0, 12) !== 'memcached://') {
      credentials.host = `memcached://${credentials.host}`;
    }

    const uri = new URL(credentials.host);

    if (!uri.host) {
      uri.host = credentials.host || '127.0.0.1';
    }

    if (!uri.port) {
      uri.port = credentials.port || 11211;
    }

    if (!uri.schema) {
      uri.schema = 'memcached://';
    }

    if (!uri.username && credentials.username) {
      uri.username = credentials.username;
    }

    if (!uri.password && credentials.password) {
      uri.password = credentials.password;
    }

    if (!uri.pathname && credentials.db) {
      uri.pathname = `/${credentials.db}`;
    }

    const client = new Memcached(`${uri.host}:${uri.port}`);

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
    const res = await toPromise(_ => client.slabs(_));
console.log(res);
    // res.split('\n').slice(1, -1).forEach((row) => {
    //   const [name, ...rest] = row.split(':');

    //   if (!this.has(name)) {
    //     this.set(name, new Db(name, this));
    //   }
  
    //   this.get(name).assign({
    //     records: parseInt(rest[0].split(',', 2)[0].split('=')[1]),
    //   });
    // })

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
    return 'memcached';
  }

  get dbManagerClass() {
    return DbManager;
  }
}

function toPromise(command) {
  return new Promise((resolve, reject) => {
    command((err, dat) => {
      console.log(err,dat)
      if (err) {
        reject(err);
      } else {
        resolve(dat);
      }
    })
  })
}

module.exports = {
  Driver,
}

const BaseSource = require('../source').Source;

class Source extends BaseSource {
  async query(query) {
    await this.connect();

    return await this.prepareQuery(
      this._client
        .db(this._connectionOpts?.credentials.db)
        .collection(this._connectionOpts?.source).find(),
      query,
    ).toArray();
  }

  map(typ, mod, val) {
    switch (mod) {
      case 'objectId':
        return typeof val === 'string' && val.length === 24 ? new (require('mongodb').ObjectId)(val) : val;
    }

    return val;
  }

  prepareQuery(cursor, query) {
    if (query?.filter) {
      cursor.filter(query.filter)
    }

    if (query?.limit > 0) {
      cursor.limit(query.limit);
    }

    if (query?.offset > 0) {
      cursor.skip(query.offset);
    }

    if (query?.projection) {
      cursor.projection(query.projection);
    }

    return cursor;
  }

  async onConnect() {
    const credentials = this._connectionOpts?.credentials || {};
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
  }
}

module.exports = {
  Source,
};

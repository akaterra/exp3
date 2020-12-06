const BaseSource = require('../source').Source;

class Source extends BaseSource {
  get pk() {
    return this._pk ?? ['_id'];
  }

  get schema() {
    return this._schema ?? { _id: (val) => typeof val === 'string' && val.length === 24 ? new (require('mongodb').ObjectId)(val) : val };
  }

  async select(query) {
    await this.connect();

    if (process?.env?.DEBUG) {
      console.debug({ query });
    }

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
      const filter = {};

      for (const [key, val] of Object.entries(query.filter)) {
        if (val && typeof val === 'object') {
          filter[key] = {};

          if (val.hasOwnProperty('$gt')) {
            filter[key].$gt = assertWhereClauseValue(val.$gt);
          }

          if (val.hasOwnProperty('$gte')) {
            filter[key].$gte = assertWhereClauseValue(val.$gte);
          }

          if (val.hasOwnProperty('$lt')) {
            filter[key].$lt = assertWhereClauseValue(val.$lt);
          }

          if (val.hasOwnProperty('$lte')) {
            filter[key].$lte = assertWhereClauseValue(val.$lte);
          }

          if (val.$in && val.$in?.length) {
            filter[key].$in = assertWhereClauseValue(val.$in);
          }

          if (val.$nin && val.$nin?.length) {
            filter[key].$nin = assertWhereClauseValue(val.$nin);
          }

          if (val.hasOwnProperty('$is')) {
            filter[key].$eq = assertWhereClauseValue(val.$is);
          }

          if (val.hasOwnProperty('$isNot')) {
            filter[key].$ne = assertWhereClauseValue(val.$isNot);
          }
        } else {
          filter[key] = assertWhereClauseValue(val);
        }
      }

      cursor.filter(filter)
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

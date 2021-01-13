const { IS_DEBUG } = require('../const');
const logger = require('../logger');
const assertWhereClauseValue = require('../source').assertWhereClauseValue;
const BaseSource = require('../source').Source;

const DEFAULT_PK = [
  '_id',
];
const DEFAULT_SCHEMA = {
  _id: (val) => typeof val === 'string' && val.length === 24 ? new (require('mongodb').ObjectId)(val) : val,
};

class Source extends BaseSource {
  get pk() {
    return this._pk ?? DEFAULT_PK;
  }

  get schema() {
    return this._schema ?? DEFAULT_SCHEMA;
  }

  get type() {
    return 'mongodb';
  }

  getCombinedKey(keys, value) {
    if (keys.length === 1) {
      return String(value[keys[0]]);
    }
    
    if (keys.length === 2) {
      return `${value[keys[0]]}\$$${value[keys[1]]}`;
    }

    return keys.reduce((a, k, i) => {
      return i ? a + '$$' + value[k] : value[k];
    }, '');
  }

  async select(query) {
    await this.connect();

    if (IS_DEBUG) {
      logger.debug({ query });
    }

    return await this._prepareQuery(
      this._client
        .db(this._connectionOpts?.credentials.db)
        .collection(this._connectionOpts?.source).find(),
      query,
    ).toArray();
  }

  async selectIn(array) {
    return [].concat(...await Promise.all(array.map((r) => this.select({ filter: r }))));
  }

  _prepareQuery(cursor, query) {
    if (query?.filter) {
      const filter = {};

      for (let [key, val] of Object.entries(query.filter)) {
        if (val && typeof val === 'object' && !val._bsontype) {
          filter[key] = {};

          if (val.hasOwnProperty('$gt')) {
            filter[key].$gt = assertWhereClauseValue(this.valToLow(key, val.$gt), key);
          }

          if (val.hasOwnProperty('$gte')) {
            filter[key].$gte = assertWhereClauseValue(this.valToLow(key, val.$gte), key);
          }

          if (val.hasOwnProperty('$lt')) {
            filter[key].$lt = assertWhereClauseValue(this.valToLow(key, val.$lt), key);
          }

          if (val.hasOwnProperty('$lte')) {
            filter[key].$lte = assertWhereClauseValue(this.valToLow(key, val.$lte), key);
          }

          if (val.$in && val.$in?.length) {
            filter[key].$in = key in this.schema ? assertWhereClauseValue(val.$in.map((val) => this.valToLow(key, val), key)) : assertWhereClauseValue(val.$in, key);
          }

          if (val.$nin && val.$nin?.length) {
            filter[key].$nin = assertWhereClauseValue(val.$nin.map((val) => this.valToLow(key, val)), key);
          }

          if (val.hasOwnProperty('$is')) {
            filter[key].$eq = assertWhereClauseValue(this.valToLow(key, val.$is), key);
          }

          if (val.hasOwnProperty('$isNot')) {
            filter[key].$ne = assertWhereClauseValue(this.valToLow(key, val.$isNot), key);
          }
        } else {
          filter[key] = assertWhereClauseValue(this.valToLow(key, val), key);
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

Source.ID = '_id';

module.exports = {
  Source,
};

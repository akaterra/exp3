const { TmpFields, TmpFieldsAsStr } = require('../const');
const assertWhereClauseValue = require('../source').assertWhereClauseValue;
const BaseSource = require('../source').Source;

const DEFAULT_PK = [
  'id',
];
const DEFAULT_SCHEMA = {

};

class Transaction {
  constructor(client) {
    this.client = client;
  }

  begin(isolationLevel) {
    return this.client.query('BEGIN');
  }

  commit() {
    return this.client.query('COMMIT');
  }

  rollback() {
    return this.client.query('ROLLBACK');
  }
}

class Source extends BaseSource {
  get pk() {
    return this._pk ?? DEFAULT_PK;
  }

  get type() {
    return 'postgresql';
  }

  async connect(context) {
    await super.connect();

    if (context?.transaction) {
      if (!context.transaction[this._name]) {
        const transaction = new Transaction(await this._client.connect());

        await transaction.begin();

        context.transaction[this._name] = transaction;
      }

      return context.transaction[this._name].client;
    }

    return this._client;
  }

  async select(query, context) {
    const client = await this.connect(context);

    const sql = this._prepareQuery(
      query,
      `SELECT ${query?.projection ? query.projection.join(',') : '*'} FROM ${this._connectionOpts.source ?? this._name}`
    );

    if (process?.env?.DEBUG) {
      console.debug({ query: sql });
    }

    return (await client.query({ text: sql })).rows;
  }

  async selectIn(array, context) {
    const client = await this.connect(context);

    const format = require('../format').format;
    const keys = Object.keys(array[0]);
    const sql = `
    SELECT * FROM ${this._connectionOpts.source ?? this._name}
    JOIN (VALUES ${format('%L', array)})
    AS t (${TmpFieldsAsStr.substr(0, keys.length * 8 - 1)})
    ON ${keys.map((k, i) => format('%I = %I', k, TmpFields[i])).join(' AND ')}
    `;

    if (process?.env?.DEBUG) {
      console.debug({ query: sql });
    }

    return (await client.query({ text: sql })).rows;
  }

  async insert(value, opts, context) {
    const client = await this.connect(context);

    const format = require('pg-format');
    const params = Object.keys(value).concat(Object.values(value));
    const sql = `
    INSERT INTO ${this._connectionOpts.source ?? this._name} (${'%I,'.repeat(params.length / 2 - 1) + '%I'})
    VALUES (${'%L,'.repeat(params.length / 2 - 1) + '%L'})
    RETURNING *
    `;
    const text = format(sql, ...params);

    if (process?.env?.DEBUG) {
      console.debug({ query: text });
    }

    return (await client.query({ text })).rows;
  }

  async update(query, value, opts, context) {
    const client = await this.connect(context);

    const format = require('pg-format');
    const params = Object.entries(value).flat();
    const sql = `
    UPDATE ${this._connectionOpts.source ?? this._name} SET ${'%I = %L,'.repeat(params.length / 2 - 1) + '%I = %L'}
    ${this._prepareQuery(query)}
    RETURNING *
    `;
    const text = format(sql, ...params);

    if (process?.env?.DEBUG) {
      console.debug({ query: text });
    }

    return (await client.query({ text })).rows;
  }

  _prepareQuery(query, sql, params) {
    const format = require('../format').format;

    if (query?.filter) {
      let clause = '';

      if (!sql) {
        sql = '';
      }

      if (!params) {
        params = [];
      }

      for (let [key, val] of Object.entries(query.filter)) {
        if (this.schema && key in this.schema) {
          val = this.schema[key](val);
        }

        if (val && typeof val === 'object') {
          if (val.hasOwnProperty('$gt')) {
            clause += '%I > %L AND ';
            params.push(key);
            params.push(assertWhereClauseValue(val.$gt));
          }

          if (val.hasOwnProperty('$gte')) {
            clause += '%I >= %L AND ';
            params.push(key);
            params.push(assertWhereClauseValue(val.$gte));
          }

          if (val.hasOwnProperty('$lt')) {
            clause += '%I < %L AND ';
            params.push(key);
            params.push(assertWhereClauseValue(val.$lt));
          }

          if (val.hasOwnProperty('$lte')) {
            clause += '%I <= %L AND ';
            params.push(key);
            params.push(assertWhereClauseValue(val.$lte));
          }

          if (val.$in && val.$in?.length) {
            clause += '%I IN (' + '%L,'.repeat(val.$in.length - 1) + '%L' + ') AND ';
            params.push(key);
            params.splice(params.length, 0, ...assertWhereClauseValue(val.$in));
          }

          if (val.$nin && val.$nin?.length) {
            clause += '%I NOT IN (' + '%L,'.repeat(val.$nin.length - 1) + '%L' + ') AND ';
            params.push(key);
            params.splice(params.length, 0, ...assertWhereClauseValue(val.$nin));
          }

          if (val.hasOwnProperty('$is')) {
            clause += '%I IS %L AND ';
            params.push(key);
            params.push(assertWhereClauseValue(val.$is));
          }

          if (val.hasOwnProperty('$isNot')) {
            clause += '%I IS NOT %L AND ';
            params.push(key);
            params.push(assertWhereClauseValue(val.$isNot));
          }
        } else {
          clause += '%I = %L AND ';
          params.push(key);
          params.push(assertWhereClauseValue(val));
        }
      }

      sql += ` WHERE ${format(clause + 'TRUE', ...params)}`;
    }

    if (query?.limit > 0) {
      sql += ` LIMIT ${format('%L', query.limit)}`;
    }

    if (query?.offset > 0) {
      sql += ` OFFSET ${format('%L', query.offset)}`;
    }

    return sql;
  }

  async onConnect() {
    const credentials = this._connectionOpts?.credentials || {};
    const { Pool } = require('pg');

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

    const client = new Pool({
      connectionString: uri.toString(),
    });

    await client.connect();

    this._client = client;

    return this;
  }
}

Source.ID = 'id';

module.exports = {
  Source,
};

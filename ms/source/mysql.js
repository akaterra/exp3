const { TmpFields, TmpFieldsAsStr } = require('../const');
const assertWhereClauseValue = require('../source').assertWhereClauseValue;
const BaseSource = require('../source').Source;

const DEFAULT_PK = [
  'id',
];
const DEFAULT_SCHEMA = {

};

class Transaction {
  constructor(client, context) {
    this.client = client;
    this.context = context;
  }

  begin() {
    if (process?.env?.DEBUG) {
      console.debug('transaction begin', { id: this.onConnectcontext?.operationId, name: this.context?.operationName });
    }

    return this.client.query('START TRANSACTION');
  }

  commit() {
    if (process?.env?.DEBUG) {
      console.debug('transaction commit', { id: this.context?.operationId, name: this.context?.operationName });
    }

    return this.client.query('COMMIT');
  }

  rollback() {
    if (process?.env?.DEBUG) {
      console.debug('transaction rollback', { id: this.context?.operationId, name: this.context?.operationName });
    }

    return this.client.query('ROLLBACK');
  }
}

class Source extends BaseSource {
  get pk() {
    return this._pk ?? DEFAULT_PK;
  }

  get transactionClass() {
    return Transaction;
  }

  get type() {
    return 'mysql';
  }

  get uniqueIdKey() {
    return this._uniqueIdKey ?? 'id';
  }

  async select(query) {
    await this.connect();

    const sql = this._prepareQuery(
      query,
      `SELECT ${query?.projection ? query.projection.join(',') : '*'} FROM ${this._connectionOpts.source ?? this._name}`
    );

    if (process?.env?.DEBUG) {
      console.debug({ query: sql });
    }

    return this._performQuery(sql);
  }

  async selectIn(array) {
    const { escape, escapeId } = require('mysql');
    const keys = Object.keys(array[0]);
    const sql = `
    SELECT * FROM ${this._connectionOpts.source ?? this._name}
    WHERE (${escapeId(keys)})
    IN (${escape(array.map((r) => Object.values(r)))})
    `;

    if (process?.env?.DEBUG) {
      console.debug({ query: sql });
    }

    return this._performQuery(sql);
  }

  async insert(value, opts, context) {
    const format = require('mysql').format;
    const params = Object.keys(value).concat(Object.values(value));
    const statement = `
    INSERT INTO ${this._connectionOpts.source ?? this._name} (${'??,'.repeat(params.length / 2 - 1) + '??'})
    VALUES (${'?,'.repeat(params.length / 2 - 1) + '?'});
    `;
    const sql = format(statement, params);

    if (process?.env?.DEBUG) {
      console.debug({ query: sql });
    }

    return this._performQuery(sql, context)
      .then((results) => this._performQuery(`SELECT * FROM ${this._connectionOpts.source ?? this._name} ${this._prepareQuery({ filter: this.getFullPkFilter(value) }) ?? `WHERE ${this.uniqueIdKey} = ${results.insertId};`}`, context));
  }

  async update(query, value, opts, context) {
    const format = require('mysql').format;
    const params = Object.entries(value).flat();
    const statement = `
    UPDATE ${this._connectionOpts.source ?? this._name} SET ${'?? = ?,'.repeat(params.length / 2 - 1) + '?? = ?'}
    ${this._prepareQuery(query)}
    `;
    const sql = format(statement, params);

    if (process?.env?.DEBUG) {
      console.debug({ query: sql });
    }

    return this._performQuery(sql, context)
      .then((results) => this._performQuery(`SELECT * FROM ${this._connectionOpts.source ?? this._name} ${this._prepareQuery({ filter: this.getFullPkFilter({ ...query, ...value }) })}`, context));
  }

  async _performQuery(query, context) {
    const client = await this.connect(context);

    return new Promise((resolve, reject) => {
      client.query(query, (error, results, fields) => {
        return error ? reject(error) : resolve(results);
      });
    });
  }

  _prepareQuery(query, sql, params) {
    const format = require('mysql').format;

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
            clause += '?? > ? AND ';
            params.push(key);
            params.push(assertWhereClauseValue(val.$gt));
          }

          if (val.hasOwnProperty('$gte')) {
            clause += '?? >= ? AND ';
            params.push(key);
            params.push(assertWhereClauseValue(val.$gte));
          }

          if (val.hasOwnProperty('$lt')) {
            clause += '?? < ? AND ';
            params.push(key);
            params.push(assertWhereClauseValue(val.$lt));
          }

          if (val.hasOwnProperty('$lte')) {
            clause += '?? <= ? AND ';
            params.push(key);
            params.push(assertWhereClauseValue(val.$lte));
          }

          if (val.$in && val.$in?.length) {
            clause += '?? IN ? AND ';
            params.push(key);
            params.splice(params.length, 0, ...assertWhereClauseValue(val.$in));
          }

          if (val.$nin && val.$nin?.length) {
            clause += '?? NOT IN ? AND ';
            params.push(key);
            params.splice(params.length, 0, ...assertWhereClauseValue(val.$nin));
          }

          if (val.hasOwnProperty('$is')) {
            clause += '?? IS ? AND ';
            params.push(key);
            params.push(assertWhereClauseValue(val.$is));
          }

          if (val.hasOwnProperty('$isNot')) {
            clause += '?? IS NOT ? AND ';
            params.push(key);
            params.push(assertWhereClauseValue(val.$isNot));
          }
        } else {
          clause += val === null ? '?? IS ? AND ' : '?? = ? AND ';
          params.push(key);
          params.push(assertWhereClauseValue(val));
        }
      }

      sql += ` WHERE ${format(clause + '1', params)}`;
    }

    if (query?.limit > 0) {
      sql += ` LIMIT ${format('?', query.limit)}`;
    }

    if (query?.offset > 0) {
      sql += ` OFFSET ${format('?', query.offset)}`;
    }

    return sql;
  }

  async onConnect() {
    const credentials = this._connectionOpts?.credentials || {};
    const { createPool } = require('mysql');

    if (!credentials.host) {
      credentials.host = 'mysql://127.0.0.1:3306';
    }

    if (credentials.host.substr(0, 8) !== 'mysql://') {
      credentials.host = `mysql://${credentials.host}`;
    }

    const uri = new URL(credentials.host);

    if (!uri.host) {
      uri.host = credentials.host || '127.0.0.1';
    }

    if (!uri.port) {
      uri.port = credentials.port || 5432;
    }

    if (!uri.schema) {
      uri.schema = 'mysql://';
    }

    if (!uri.username && (credentials.username || credentials.password)) {
      uri.user = credentials.username || (credentials.password ? 'root' : undefined);
    }

    if (!uri.password && credentials.password) {
      uri.password = credentials.password;
    }

    if (!uri.pathname) {
      uri.pathname = `/${credentials.db || 'local'}`;
    }

    const client = await createPool(uri.toString());

    this._client = client;

    return this;
  }

  async onTransactionCreate(context) {
    const connection = await new Promise((resolve, reject) => {
      this._client.getConnection((error, connection) => {
        return error ? reject(error) : resolve(connection);
      });
    });

    return new Transaction(connection, context);
  }
}

Source.ID = 'id';

module.exports = {
  Source,
};

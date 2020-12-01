const BaseSource = require('../source').Source;

class Source extends BaseSource {
  async select(query) {
    await this.connect();

    return (await this._client.query({ text: this.prepareQuery(query) })).rows;
  }

  map(typ, mod, val) {
    return val;
  }

  prepareQuery(query) {
    let format = require('pg-format');
    let sql = `SELECT ${query?.projection ? query.projection.join(',') : '*'} FROM ${this._connectionOpts.source ?? this._name}`;

    if (query?.filter) {
      let clause = '';
      let params = [];

      for (const [key, val] of Object.entries(query.filter)) {
        if (val && typeof val === 'object') {
          if (val.hasOwnProperty('$gt')) {
            clause += '%I > %L AND ';
            params.push(key);
            params.push(val.$gt);
          }

          if (val.hasOwnProperty('$gte')) {
            clause += '%I >= %L AND ';
            params.push(key);
            params.push(val.$gte);
          }

          if (val.hasOwnProperty('$lt')) {
            clause += '%I < %L AND ';
            params.push(key);
            params.push(val.$lt);
          }

          if (val.hasOwnProperty('$lte')) {
            clause += '%I <= %L AND ';
            params.push(key);
            params.push(val.$lte);
          }

          if (val.$in && val.$in?.length) {
            clause += '%I IN (' + '%L,'.repeat(val.$in.length - 1) + '%L' + ') AND ';
            params.push(key);
            params.splice(params.length, 0, ...val.$in);
          }

          if (val.$nin && val.$nin?.length) {
            clause += '%I NOT IN (' + '%L,'.repeat(val.$nin.length - 1) + '%L' + ') AND ';
            params.push(key);
            params.splice(params.length, 0, ...val.$nin);
          }

          if (val.hasOwnProperty('$is')) {
            clause += '%I IS %L AND ';
            params.push(key);
            params.push(val.$is);
          }

          if (val.hasOwnProperty('$isNot')) {
            clause += '%I IS NOT %L AND ';
            params.push(key);
            params.push(val.$isNot);
          }
        } else {
          clause += '%I = %L AND ';
          params.push(key);
          params.push(val);
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

    return this;
  }
}

module.exports = {
  Source,
};

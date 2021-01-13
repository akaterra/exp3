# PodGraph

PodGraph is a data operator over multitype sources inspired by objection.js graph manipulation subsystem.

Supported sources:

* Custom CRUD API
* GraphQL
* MongoDB
* MySQL
* PostgreSQL
* Redis

### Example

```js
const Resolver = require('podgraph').Resolver;
const Source = require('podgraph').Source;
const Transaction = require('podgraph').Transaction;

// define sources

const mysqlSource = new Source.Mysql('mysqlSource', { credentials: {
  host: 'mysql://root:root@127.0.0.1:3306/test',
  db: 'test_db',
}});
const postgresSource = new Source.Postgresql('postgresSource', { credentials: {
  host: 'postgresql://root:root@127.0.0.1:5432/test',
  db: 'test_db',
}});

const testStream1 = mysqlSource.stream('test_table');
const testStream2 = postgresSource.stream('test_table');

// define graph resolver

const resolver = new Resolver();

resolver.addHasRelation(testStream1, 'id', testStream2); // mysql.test_db.test_table.id -> postgresql.test_db.test_table.id
resolver.addBelongsRelation(testStream2, { test_id: Source.Postgresql.ID }, testStream1); // postgresql.test_db.test_table.test_id -> mysql.test_db.test_table.id
```

Select graph:

```js
await resolver.selectGraph(testStream2, { limit: 5 }, [ Stream1 ]);
```

Select graph in transaction:

```js
await resolver.transaction(trx => trx.selectGraph(testStream2, { limit: 5 }, [ testStream1 ]), { isolationLevel: Transaction.READ_COMMITTED });
```

### Transactions

| <div style="min-width:150px">Source</div> | <div style="min-width:150px;text-align:center">READ_UNCOMMITTED</div> | <div style="min-width:150px;text-align:center">READ_COMMITTED</div> | <div style="min-width:150px;text-align:center">REPEATABLE_READ</div> | <div style="min-width:150px;text-align:center">SERIALIZABLE</div> |
| ------ | ---------------- | -------------- | --------------- | ------------ |
| MongoDB | | | | |
| MySQL | <div style="text-align:center">✓</div> | <div style="text-align:center">✓</div> | <div style="text-align:center">✓</div> | <div style="text-align:center">✓</div> |
| PostgreSQL | <div style="text-align:center">✓</div> | <div style="text-align:center">✓</div> | <div style="text-align:center">✓</div> | <div style="text-align:center">✓</div> |
| Redis | <div style="text-align:center">✓</div> | <div style="text-align:center">✓</div> | <div style="text-align:center">✓</div> | <div style="text-align:center">✓</div> |

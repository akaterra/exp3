const cm = require('./server/connection_manager').connectionManager;
const clickhouseDriver = require('./server/driver/clickhouse.driver');
const mongodbDriver = require('./server/driver/mongodb.driver');
const mysqlDriver = require('./server/driver/mysql.driver');
const postgresDriver = require('./server/driver/postgresql.driver');
const redisDriver = require('./server/driver/redis.driver');

(async () => {
  cm
    .registerDriver(clickhouseDriver.Driver)
    .registerDriver(mongodbDriver.Driver)
    .registerDriver(mysqlDriver.Driver)
    .registerDriver(postgresDriver.Driver)
    .registerDriver(redisDriver.Driver);

  const conn = await cm.connect('pg1', {
    driver: 'postgresql',

    password: 'Mg12345!',
  });

  await conn.dbManager.select();
  await conn.dbManager.get('deliveries').schemaManager.select();
  await conn.dbManager.get('deliveries').schemaManager.get('public').sourceManager.select();
  console.log(JSON.stringify(await conn));

  const connMongo = await cm.connect('mongo1', {
    driver: 'mongodb',

//    password: 'Mg12345!',
  });

  await connMongo.dbManager.select();
  await connMongo.dbManager.get('test').schemaManager.select();
  await connMongo.dbManager.get('test').schemaManager.get().sourceManager.select();
  console.log(JSON.stringify(await connMongo));

  const connRedis = await cm.connect('redis1', {
    driver: 'redis',

//    password: 'Mg12345!',
  });

  await connRedis.dbManager.select();
  await connRedis.dbManager.get('db8').schemaManager.select();
  await connRedis.dbManager.get('db8').schemaManager.get().sourceManager.select();
  console.log(JSON.stringify(await connRedis));

  const connClickhouse = await cm.connect('clickhouse1', {
    driver: 'clickhouse',

//    password: 'Mg12345!',
  });

  await connClickhouse.dbManager.select();
  await connClickhouse.dbManager.get('system').schemaManager.select();
  await connClickhouse.dbManager.get('system').schemaManager.get().sourceManager.select();
  await connClickhouse.dbManager.get('system').schemaManager.get().sourceManager.get('aggregate_function_combinators').columnManager.select();
  console.log(JSON.stringify(await connClickhouse));
})();

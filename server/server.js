const bodyParser = require('body-parser');
const cors = require('cors');
const express = require('express');
const cm = require('./connection_manager').connectionManager;

function run(port) {
  const app = express();

  app.use(bodyParser.json());
  app.use(cors());

  function error(fn) {
    return async (req, res) => {
      try {
        res.json(await fn(req, res));
      } catch (e) {
        console.error(e);

        res.status(e.status || 500).json({ error: e });
      }
    }
  }

  app.get('/driver', error((req, res) => {
    return cm.toJSON().drivers;
  }));

  app.get('/connection', error(async (req, res) => {
    return cm.toJSON().connections;
  }));

  app.post('/connection', error(async (req, res) => {
    return await cm.connectWithAutoId(req.body);
  }));

  app.get('/connection/:connectionName/db', error(async (req, res) => {
    const dbManager = cm
      .get(req.params.connectionName)
      .dbManager;

    return await dbManager.select();
  }));

  app.get('/connection/:connectionName/db/:dbName', error(async (req, res) => {
    const dbManager = cm
      .get(req.params.connectionName)
      .dbManager;

    return (await dbManager.select())[req.params.dbName] || null;
  }));

  app.get('/connection/:connectionName/db/:dbName/schema', error(async (req, res) => {
    const schemaManager = cm
      .get(req.params.connectionName)
      .getNested(req.params.dbName).schemaManager;

    return await schemaManager.select();
  }));

  app.get('/connection/:connectionName/db/:dbName/schema/:schemaName', error(async (req, res) => {
    const schemaManager = cm
      .get(req.params.connectionName)
      .getNested(req.params.dbName).schemaManager;

    return (await schemaManager.select())[req.params.schemaName] || null;
  }));

  app.get('/connection/:connectionName/db/:dbName/schema/:schemaName/source', error(async (req, res) => {
    const sourceManager = cm
      .get(req.params.connectionName)
      .getNested(req.params.dbName, req.params.schemaName).sourceManager;

    return await sourceManager.select();
  }));

  app.get('/connection/:connectionName/db/:dbName/schema/:schemaName/source/:sourceName', error(async (req, res) => {
    const sourceManager = cm
      .get(req.params.connectionName)
      .getNested(req.params.dbName, req.params.schemaName).sourceManager;

    return (await sourceManager.select())[req.params.sourceName] || null;
  }));

  app.post('/connection/:connectionName/db/:dbName/schema/:schemaName/source/:sourceName/select', error(async (req, res) => {
    const sourceManager = cm
      .get(req.params.connectionName)
      .getNested(req.params.dbName, req.params.schemaName, req.params.sourceName);

    return await sourceManager.select(req.body);
  }));

  app.listen(port || 9009, () => {

  });
}

module.exports = {
  run,
};

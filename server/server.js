const bodyParser = require('body-parser');
const express = require('express');
const cm = require('./connection_manager').connectionManager;

function run(port) {
  const app = express();

  app.use(bodyParser.json());

  app.get('/driver', (req, res) => {
    res.json(cm.toJSON().drivers);
  });

  app.post('/connection', async (req, res) => {
    res.json(await cm.connectWithAutoId(req.body));
  });

  app.get('/connection/:connectionName/db', async (req, res) => {
    const dbManager = cm.get(req.params.connectionName).dbManager;

    await dbManager.select();

    res.json(dbManager);
  });

  app.get('/connection/:connectionName/db/:dbName/schema', async (req, res) => {
    const schemaManager = cm.get(req.params.connectionName).dbManager.get(req.params.dbName).schemaManager;

    await schemaManager.select();

    res.json(schemaManager);
  });

  app.get('/connection/:connectionName/db/:dbName/schema/:schemaName/source', async (req, res) => {
    const sourceManager = cm.get(req.params.connectionName).dbManager.get(req.params.dbName).schemaManager.get(req.params.schemaName).sourceManager;

    await sourceManager.select();

    res.json(sourceManager);
  });

  app.listen(port || 9009, () => {

  });
}

module.exports = {
  run,
};

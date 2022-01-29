const express = require('express');
const app = express();
const port = 3030;

const GOODS = [{
  id: 1,
}, {
  id: 2,
}, {
  id: 3,
}];

function json(f) {
  return function(req, res, next) {
    res.json(f(req, res));
  } 
}

app.get('/goods', json((req, res) => {
  console.log(req.query);

  if (req.query.id) {
    return GOODS.filter((g) => req.query.id.split(',').includes(String(g.id)));
  }

  return GOODS;
}));

app.listen(port, () => {
  console.log(`Express app listening at http://localhost:${port}`);
});

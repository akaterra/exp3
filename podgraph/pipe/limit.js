const _ = require('lodash');
const i = require('invary');

function*limit(limit, stream) {
  for (const row of stream) {
    if (limit <= 0) {
      break;
    }

    yield row;

    limit -= 1;
  }
}

module.exports = {
  pipe: limit,
  limit,
};

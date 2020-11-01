const _ = require('lodash');
const i = require('invary');

function*offset(offset, stream) {
  for (const row of stream) {
    if (offset > 0) {
      offset -= 1;

      continue;
    }

    yield row;
  }
}

module.exports = {
  pipe: offset,
  offset,
};

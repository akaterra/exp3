const _ = require('lodash');
const i = require('invary');

function*unwind(key, stream) {
  for (const row of stream) {
    const val = i.get(row, key);

    if (val !== undefined && Array.isArray(val)) {
      if (val.length === 0) {
        yield i.set(row, key, undefined);
      } else for (const sub of val) {
        yield i.set(row, key, sub);
      }
    } else {
      yield row;
    }
  }
}

module.exports = {
  pipe: unwind,
  unwind,
};

const _ = require('lodash');

function set(record, key, val) {
  let dirty = false;

  if (arguments.length === 2) {
    for ([key, val] of Object.entries(key)) {
      if (!dirty) {
        if (record[key] !== val) {
          record.$$_drt = dirty = true;
          record[key] = val;
        }
      } else {
        record[key] = val;
      }
    }
  } else {
    if (record[key] !== val) {
      record.$$_drt = true;
      record[key] = val;
    }
  }

  return record;
}

function setNested(record, key, val) {
  let dirty = false;

  if (arguments.length === 2) {
    for ([key, val] of Object.entries(key)) {
      if (!dirty) {
        if (_.get(key) !== val) {
          record.$$_drt = dirty = true;
          _.set(record, key, val);
        }
      } else {
        _.set(record, key, val);
      }
    }
  } else {
    if (_.get(key) !== val) {
      record.$$_drt = true;
      _.set(record, key, val);
    }
  }

  return record;
}

module.exports = {
  set,
  setNested,
}

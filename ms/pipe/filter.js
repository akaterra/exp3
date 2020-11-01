const _ = require('lodash');
const i = require('invary');

function*filter(filter, stream) {
  for (const row of stream) {
    for (const [condKey, condVal] of Object.entries(filter)) {
      const dataVal = i.get(row, condKey);

      if (condVal && typeof condVal === 'object') {
        if (condVal.$gt && dataVal <= condVal.$gt) {
          continue;
        }

        if (condVal.$gte && dataVal < condVal.$gte) {
          continue;
        }

        if (condVal.$lt && dataVal >= condVal.$lt) {
          continue;
        }

        if (condVal.$lte && dataVal > condVal.$lte) {
          continue;
        }

        if (condVal.$eq && dataVal !== condVal.$eq) {
          continue;
        }

        if (condVal.$ne && dataVal === condVal.$ne) {
          continue;
        }

        if (condVal.$in && !condVal.$in.includes(dataVal)) {
          continue;
        }

        if (condVal.$nin && condVal.$nin.includes(dataVal)) {
          continue;
        }

        if (condVal.$existing && dataVal === undefined) {
          continue;
        }

        if (condVal.$notExisting && dataVal !== undefined) {
          continue;
        }

        if (condVal.$significant && (dataVal === undefined || dataVal === null)) {
          continue;
        }

        if (condVal.$notSignificant && (dataVal !== undefined && dataVal !== null)) {
          continue;
        }

        if (condVal.$regex && (typeof dataVal !== 'string' || !new RegExp(condVal).test(dataVal))) {
          continue;
        }

        yield row;
      } else if (condVal && Array.isArray(condVal)) {
        if (condVal.includes(dataVal)) {
          yield row;
        }
      } else if (dataVal === condVal) {
        yield row;
      }
    }
  }
}

module.exports = {
  pipe: filter,
  filter,
};

const _ = require('lodash');
const i = require('invary');

function*group(keys, aggs, stream) {
  const grp = {};

  for (const row of stream) {
    let grpKey = '';

    if (Array.isArray(keys)) {
      for (const key of keys) {
        grpKey += _.get(row, key, '') + chr(0);
      }
    } else {
      grpKey = String(_.get(row, keys, ''));
    }

    if (!grp[grpKey]) {
      grp[grpKey] = { ...row, $$_key: grpKey };
    }

    for (const [condKey, condVal] of Object.entries(aggs)) {
      if (condVal.$count) {
        _.set(grp[grpKey], condKey, _.get(grp[grpKey], condKey, 0) + 1);
      }

      if (condVal.$first && !_.has(grp[grpKey], condKey)) {
        _.set(grp[grpKey], condKey, _.get(row, condVal.$first));
      }

      if (condVal.$last) {
        _.set(grp[grpKey], condKey, _.get(row, condVal.$last));
      }

      if (condVal.$max && (!_.has(grp[grpKey], condKey) || _.get(grp[grpKey], condKey) < _.get(row, condVal.$max))) {
        _.set(grp[grpKey], condKey, _.get(row, condVal.$max));
      }

      if (condVal.$min && (!_.has(grp[grpKey], condKey) || _.get(grp[grpKey], condKey) > _.get(row, condVal.$max))) {
        _.set(grp[grpKey], condKey, _.get(row, condVal.$min));
      }

      if (condVal.$mul && typeof _.get(row, condVal.$mul, 1) === 'number') {
        _.set(grp[grpKey], condKey, _.get(row, condVal.$mul, 1) * _.get(grp[grpKey], condKey, 1));
      }

      if (condVal.$push) {
        if (!_.has(grp[grpKey], condKey)) {
          _.set(grp[grpKey], condKey, []);
        }

        if (_.has(row, condVal.$push)) {
          let dataVal = _.get(row, condVal.$push);

          if (Array.isArray(dataVal)) {
            grp[grpKey] = grp[grpKey].concat(dataVal);
          } else {
            _.get(grp[grpKey], condKey).push(dataVal);
          }
        }
      }

      if (condVal.$sum && typeof _.get(row, condVal.$sum, 1) === 'number') {
        _.set(grp[grpKey], condKey, _.get(row, condVal.$sum, 0) + _.get(grp[grpKey], condKey, 0));
      }  
    }
  }

  for (const row of Object.values(grp)) {
    yield row;
  }
}

module.exports = {
  pipe: group,
  group,
};

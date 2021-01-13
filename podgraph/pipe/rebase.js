const _ = require('lodash');
const i = require('invary');

function*rebase(cond, stream) {
  for (const row of stream) {
    let dataRow = row;

    for (const [condKey, condVal] of Object.entries(cond)) {
      if (condVal === false) {
        dataRow = _.omit(dataRow, condKey);
      } else {
        let source;

        if (typeof condVal === 'object') {
          if (!condVal.$source) {
            throw new Error(`Rebase pipe must define "${condKey}.$source" key`)
          }

          if (Array.isArray(condVal.$source)) {
            source = condVal.$source;
          } else {
            source = [condVal.$source];
          }
        } else {
          source = [condVal];
        }

        if (source) {
          if (!source.every((k) => typeof k === 'string')) {
            throw new Error(`Rebase pipe "${condKey}.$source" key type must be String | [String]`);
          }

          for (const dataKey of source) {
            if (_.has(row, dataKey)) {
              let dataVal = _.get(row, dataKey);

              if (typeof condVal === 'object') {
                switch (condVal.$cast) {
                  case 'number' && typeof dataVal === 'string':
                    dataVal = parseFloat(dataVal);
            
                    if (!isNaN(dataVal)) {            
                      continue;
                    }
            
                    break;
                  case 'string':
                    dataVal = dataVal instanceof Data ? dataVal.toISOString() : String(dataVal);
            
                    break;
                }
              }

              dataRow = i.set(dataRow, condKey, dataVal);
              
              break;
            }
          }
        }
      }
    }

    yield dataRow;
  }
}

module.exports = {
  pipe: rebase,
  rebase,
};

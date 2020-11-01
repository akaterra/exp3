const _ = require('lodash');
const i = require('invary');

function*rebaseAndUnwindRelation(relation, related, stream) {
  const relationRaw = [relation];

  for (const row of stream) {
    const dataRel = row.$$_rel?.[relation];

    if (dataRel !== undefined && related?.[relation]) {
      for (const dataRef of Array.isArray(dataRel) ? dataRel : [dataRel]) {
        for (const sub of Array.isArray(related?.[relation]?.[dataRef]) ? related?.[relation]?.[dataRef] : [related?.[relation]?.[dataRef]]) {
          yield i.set(row, relationRaw, sub);
        }
      }
    } else {
      yield row;
    }
  }
}

module.exports = {
  pipe: rebaseAndUnwindRelation,
  rebaseAndUnwindRelation,
};

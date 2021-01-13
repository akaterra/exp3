const SEED = String(Date.now()).substr(0, 6);

module.exports = {
  EMPTY: Symbol('empty'),
  IS_DEBUG: process.env.DEBUG ? process.env.DEBUG.indexOf('podgraph') !== -1 : false,
  SEED,
  TMP_FIELDS: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j'].map((f) => f + SEED),
  TMP_FIELDS_AS_STR: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j'].map((f) => f + SEED).join(','),
};

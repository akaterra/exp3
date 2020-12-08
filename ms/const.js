const SEED = String(Date.now()).substr(0, 6);

module.exports = {
  Empty: Symbol('empty'),
  Seed: SEED,
  TmpFields: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j'].map((f) => f + SEED),
  TmpFieldsAsStr: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j'].map((f) => f + SEED).join(','),
};

const stopSymbols1 = ' =!&|';
const stopSymbols2 = ' ,%()';

function parse(str) {
  let ops = [];

  for (const lex of split(str)) {

  }
}

function split(str) {
  let cur = '';
  let tok = [];
  let isQ = false;
  let stQ = 0;

  for (let i = 0, l = str.length, sym = str[0]; i < l; i += 1, sym = str[i]) {
    if (sym === '"') {
      if (i === 0 || (i > 0 && str[i - 1] !== '\\')) {
        if (cur) {
          tok.push([cur, 's']);

          cur = '';
        }

        if (isQ) {
          tok.push([str.substring(stQ, i).replace(/\\"/g, '"'), 'q']);
        } else {
          stQ = i + 1;
        }

        isQ = !isQ;
      }
    } else {
      if (isQ) {
        continue;
      }

      const isStopSymbol1 = stopSymbols1.indexOf(sym) !== -1;
      const isStopSymbol2 = stopSymbols2.indexOf(sym) !== -1;

      if (!isStopSymbol1 && !isStopSymbol2) {
        cur += sym;
      } else {
        if (cur) {
          tok.push([cur, 's']);

          cur = '';
        }

        if (sym === ' ') {
          continue;
        } else {
          if (isStopSymbol1 && tok.length && tok[tok.length - 1][1] === 'c') {
            tok[tok.length - 1][0] += sym;
          } else {
            tok.push([sym, 'c']);
          }
        }
      }
    }
  }

  return tok;
}

module.exports = {
  parse,
  split,
};


console.log(split('"     " a & ngf ! = 7 & (j="7 =^&\\"hhgd")'));
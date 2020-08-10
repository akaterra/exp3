const stopSymbols = ' =,%&|()';

function parse(str) {
  let ops = [];

  for (const lex of split(str)) {

  }
}

function split(str) {
  let cur = '';
  let tok = [];
  let ixQ = 0;
  let isQ = false;

  for (let i = 0, l = str.length, sym = str[0]; i < l; i += 1, sym = str[i]) {
    if (sym === '"') {
      if (i === 0 || (i > 0 && str[i - 1] !== '\\')) {
        if (cur) {
          tok.push([cur, 's']);

          cur = '';
        }

        if (isQ) {
          tok.push([str.substring(ixQ, i).replace(/\\"/g, '"'), 's']);
        } else {
          ixQ = i + 1;
        }

        isQ = !isQ;
      }
    } else {
      if (isQ) {
        continue;
      }

      if (stopSymbols.indexOf(sym) === -1) {
        cur += sym;
      } else {
        if (cur) {
          tok.push([cur, 's']);

          cur = '';
        }

        if (sym === ' ') {
          continue;
        } else {
          tok.push([sym, 'c']);
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


console.log(split('"     " a & n = 7 & (j="7 =^&\\"hhgd")'));
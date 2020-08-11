const STOP_SYM = ' ,()=&&|<>!';
const STOP_LEX = [
  ' ',
  ',',
  '(',
  ')',
  '>=',
  '<=',
  '>',
  '<',
  '=',  // eq
  '!=', // not eq
  '%',  // like
  '!%', // not like
  '&',  // and
  '!&', // not and
  '|',  // or
  '!|', // not or
]

function parseLexVal(lex) {
  if (lex[1] === 'q') {
    return lex[0];
  }

  if (lex[0].toLowerCase() === 'true') {
    return true;
  }

  if (lex[0].toLowerCase() === 'false') {
    return false;
  }

  if (lex[0].toLowerCase() === 'null') {
    return null;
  }

  return parseFloat(lex[0]);
}

function parse(str, ops) {
  if (!ops) {
    ops = [];
  }

  ops.push({});

  let lex;
  let nxt = fetch(split(str));

  while (lex = nxt(), lex !== undefined) {
    if (isC(lex)) {
      return ops; // unexpected control char
    }

    let key = lex[0];

    if (!ops[ops.length - 1][key]) {
      ops[ops.length - 1][key] = {};
    }

    lex = nxt();

    if (isC(lex)) {
      switch (lex[0]) {
        case '>':
          lex = nxt();

          if (lex === undefined || isC(lex)) {
            return ops;
          }

          ops[ops.length - 1][key].gt = parseLexVal(lex);
          break;
        case '<':
          lex = nxt();

          if (lex === undefined || isC(lex)) {
            return ops;
          }

          ops[ops.length - 1][key].lt = parseLexVal(lex);
          break;
        case '>=':
          lex = nxt();

          if (lex === undefined || isC(lex)) {
            return ops;
          }

          ops[ops.length - 1][key].gte = parseLexVal(lex);
          break;
        case '<=':
          lex = nxt();

          if (lex === undefined || isC(lex)) {
            return ops;
          }

          ops[ops.length - 1][key].lte = parseLexVal(lex);
          break;
        case '=':
          lex = nxt();

          if (lex === undefined || isC(lex)) {
            return ops;
          }

          ops[ops.length - 1][key].eq = parseLexVal(lex);
          break;
        case '!=':
          lex = nxt();

          if (lex === undefined || isC(lex)) {
            return ops;
          }

          ops[ops.length - 1][key].ne = parseLexVal(lex);
          break;
        case '&':
          ops[ops.length - 1][key].eq = true;
          break;
        case '|':
          ops.push({});
          break;
      }
    } else {
      ops[ops.length - 1][key].eq = true;

      nxt(-2);
    }
  }

  return ops;
}

function isC(lex) {
  return lex && lex[1] === 'c';
}

function fetch(arr) {
  let ind = 0;

  return function (off) {
    if (off) {
      ind += off;
    }

    return arr[ind ++];
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

      if (STOP_SYM.indexOf(sym) === -1) {
        cur += sym;
      } else {
        if (cur) {
          tok.push([cur, 's']);

          cur = '';
        }

        if (sym === ' ') {
          continue;
        } else {
          if (tok.length) {
            const stopLex = STOP_LEX.findIndex(_ => _ === tok[tok.length - 1][0] + sym);

            if (stopLex !== -1) {
              tok[tok.length - 1][0] += sym;
            } else {
              tok.push([sym, 'c']);
            }
          } else {
            tok.push([sym, 'c']);
          }
        }
      }
    }
  }

  if (cur) {
    tok.push([cur, 's']);
  }

  return tok;
}

module.exports = {
  parse,
  split,
};


// console.log(split('"     " a & ngf ! = 7 & (j="7 =^&\\"hhgd")'));
console.log(parse('x a & c >= "bcvbxvcbx  f" & d & e'));
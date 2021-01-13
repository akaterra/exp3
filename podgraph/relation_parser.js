const cache = {};
const rules = {
  b: [/^([a-zA-Z0-9_\-$\.]*[a-zA-Z0-9_\-$]+)/, { tok: true }],
  c: [/^(\.\[)/, { sub: true }],
  e: [/^(\,)/, { set: true }],
  f: [/^(\])/, { ret: true }],
};

function parse(str) {
  let rel = {};
  let relStk = [];
  let retRel = rel;
  let sub = '';

  for (let i = 0; i < str.length;) {
    let add = 0;

    for (const tuple of Object.values(rules)) {
      const match = str.substr(i).match(tuple[0]);

      if (match) {
        add = match[tuple[1].add ?? 1].length;

        if (tuple[1].tok) {
          sub += match[1];
        }

        if (tuple[1].set) {
          if (sub) {
            rel[sub] = true;
          }

          sub = '';
        }
        
        if (tuple[1].sub) {
          relStk.push(rel);
          rel[sub] = {};
          rel = rel[sub];  

          sub = '';
        }
        
        if (tuple[1].ret) {
          if (sub) {
            rel[sub] = true;
          }
          rel = relStk.pop();
          sub = '';
        }

        break;
      }
    }

    if (add === 0) {
      throw new Error('Invalid syntax');
    } else {
      i += add;
    }
  }

  cache[str] = retRel;

  return retRel;
}

function build(obj, arr, pre) {
  if (!arr) {
    arr = [];
  }

  if (!pre) {
    pre = [];
  }

  for (const key of Object.keys(obj)) {
    if (key.indexOf('.') !== -1) {
      let ref = obj;

      key.split('.').forEach((key, ind, arr) => {
        if (!(key in ref)) {
          ref[key] = ind === arr.length - 1 ? true : {};
        }

        ref = ref[key];
      });

      delete obj[key];
    }
  }

  Object.entries(obj).forEach(([key, val]) => {
    if (val && typeof val === 'object') {
      build(val, arr, [].concat(pre, key));
    } else {
      arr.push([].concat(pre, key));
    }
  });

  return arr;
}

module.exports = {
  build,
  parse,
  parseAndBuild(str) {
    str = str.replace(/\s/g, '') + ',';

    if (str in cache) {
      return cache[str];
    }

    cache[str] = build(parse(str));

    return cache[str];
  }
}

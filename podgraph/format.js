function escapeSingleQuotes(str) {
  return typeof str === 'string' ? str.replace(/'/g, `''`) : str;
}

function escapeDoubleQuotes(str) {
  return typeof str === 'string' ? str.replace(/"/g, `""`) : str;
}

const REG = /(\%I|\%L|\%S)/g;

function format(pattern, ...args) {
  let i = -1;

  return pattern.replace(REG, (_, op) => {
    i += 1;

    const value = args[i];

    switch (op) {
      case '%C':
        return `"${escapeDoubleQuotes(value)}"`;

      case '%L':
        return Array.isArray(value) ? formatArray(value) : formatMixed(value);
    }

    return value;
  });
}

function formatMixed(value) {
  if (value instanceof Date) {
    return `'${value.toISOString()}'`;
  }

  if (value === null || value === undefined) {
    return 'NULL';
  }

  if (typeof value === 'boolean') {
    return value ? 'TRUE' : 'FALSE';
  }

  if (typeof value === 'number') {
    return value;
  }

  if (typeof value === 'object') {
    return formatArray(Object.values(value));
  }

  return `'${escapeSingleQuotes(value)}'`;
}

function formatArray(array) {
  return `(${array.map((v) => Array.isArray(v) ? formatArray(v) : formatMixed(v)).join(',')})`;
}

module.exports = {
  format,
};

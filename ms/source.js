const { throws } = require("assert");

class Source {
  get name() {
    return this._name;
  }

  get pk() {
    return this._pk;
  }

  get schema() {
    return this._schema;
  }

  constructor(name, connectionOpts) {
    this._connectionOpts = connectionOpts;
    this._isConnected = false;
    this._name = name;
    this._sources = new Map();
  }

  getCombinedKey(keys, value) {
    if (keys.length === 1) {
      return value[keys];
    }
    
    if (keys.length === 2) {
      return `${value[keys[0]]}\$$${value[keys[1]]}`;
    }

    return keys.reduce((a, k, i) => {
      return i ? a + '$$' + value[k] : value[k];
    }, '');
  }

  getFullPkFilter(value) {
    if (!this.pk?.length) {
      return value;
    }

    for (const pkKey of this.pk) {
      if (!(pkKey in value)) {
        return null;
      }
    }

    return this.getPkFilter(value);
  }

  getPkFilter(value) {
    if (!this.pk?.length) {
      return value;
    }

    const pkFilter = {};

    for (const pkKey of this.pk) {
      pkFilter[pkKey] = value[pkKey];
    }

    return pkFilter;
  }

  getRelationFilter(keys1, keys2, value) {
    if (keys1.length === 1) {
      return { [keys1[0]]: value[keys2[0]] };
    }

    const filter = {};

    for (let i = 0, l = keys1.length; i < l; i += 1) {
      filter[keys1[i]] = value[keys2[i]];
    }

    return filter;
  }

  setPk(...keys) {
    this._pk = keys;

    return this;
  }

  setSchema(schema) {
    this._schema = schema;

    return this;
  }

  asSource(source, customName) {
    const key = `${this._name}.${customName || source}`;

    if (!this._sources.has(key)) {
      this._sources.set(key, new (Object.getPrototypeOf(this).constructor)(
        `${this._name}.${customName || source}`,
        { ...this._connectionOpts, source },
      ).setPk(...this.pk).setSchema(this.schema));
    }
    
    return this._sources.get(key);
  }

  async connect() {
    if (this._isConnected) {
      return this;
    }

    await this.onConnect();

    this._isConnected = true;

    return this;
  }

  async select(query) {
    return [];
  }

  async selectIn(key, ids) {
    return this.select({ filter: { [key]: { $in: ids } } });
  }

  async insert(value, opts) {
    throw new Error('Not implemented');
  }

  async update(query, value, opts) {
    throw new Error('Not implemented');
  }

  async upsert(value, opts) {
    const pkFilter = this.getFullPkFilter(value);
    const data = pkFilter
      ? await this.update({ filter: pkFilter }, value)
      : await this.insert(value);
  
    if (pkFilter && !data?.length) {
      if (opts?.insertMissing) {
        return this.insert(value);
      } else {
        throw new Error('"insertMissing: true" option must be used to insert entity with predefined primary key(s)');
      }
    }

    return data;
  }

  map(typ, val) {
    return val;
  }

  async onConnect() {
    
  }
}

module.exports = {
  Source,
  assertWhereClauseValue(value) {
    if (Array.isArray(value)) {
      for (const val of value) {
        if (val === undefined) {
          throw new Error('"undefined" list value is not allowed in where clause');
        }
      }
    } else {
      if (value === undefined) {
        throw new Error('"undefined" value is not allowed in where clause');
      }
    }

    return value;
  },
};

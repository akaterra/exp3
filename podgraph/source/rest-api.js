const { IS_DEBUG } = require('../const');
const BaseSource = require('../source').Source;

class Source extends BaseSource {
  get lib() {
    if (!this._lib) {
      this._lib = require('node-fetch');
    }

    return this._lib;
  }

  constructor(name, connectionOpts) {
    super(name, connectionOpts);

    if (connectionOpts?.executors) {
      this._executors = connectionOpts?.executors;
    }
  }

  getExecutor(alias) {
    if (!this._executors?.[alias]) {
      throw new Error(`Executor "${alias}" in not registered`);
    }

    return this._executors[alias];
  }

  setExecutors(executors) {
    this._executors = executors;

    return this;
  }

  async select(query) {
    if (IS_DEBUG) {
      logger.debug({});
    }

    return this._prepareQuery(this.getExecutor('select'), query);
  }

  async selectIn(array) {
    if (IS_DEBUG) {
      logger.debug({});
    }

    return this._executors.selectIn ? this._prepareQuery(this._executors.selectIn, array) : Promise.all(array.map((a) => this._prepareQuery(this.getExecutor('select'), a)));
  }

  _prepareQuery(executor, params) {
    if (!executor) {
      throw new Error('Executor required');
    }

    if (typeof executor === 'function') {
      return executor(params, this.lib);
    }

    if (typeof executor === 'string') {
      return (this.lib)((this._connectionOpts.baseUrl ?? '') + replaceUrlPlaceholdersAndRemoveFound(executor, params), { method: 'GET', headers: this._connectionOpts?.headers });
    }

    if (typeof executor === 'object') {
      if (executor.onRequest) {
        params = executor.onRequest(params);
      }

      return (this.lib)(
        (this._connectionOpts.baseUrl ?? '') + replaceUrlPlaceholdersAndRemoveFound(executor.path ?? '', params),
        {
          method: executor.method ?? 'GET',
          body: params,
          headers: { ...this._connectionOpts?.headers, ...executor.headers },
        },
      ).then((res) => res.json()).then((res) => {
        if (executor.onResponse) {
          return executor.onResponse(res);
        }

        return res;
      });
    }
  }
}

module.exports = {
  Source,
};

const usedParams = new Set();

function replaceUrlPlaceholdersAndRemoveFound(str, params) {
  usedParams.clear();

  str = str.replace(/:(\w+)/g, (_, p) => {
    if (p in params) {
      usedParams.add(p);

      return Array.isArray(params[p])
        ? params[p].map(encodeURIComponent).join(',')
        : encodeURIComponent(params[p]);
    }

    return '';
  });

  for (const p of usedParams) {
    delete params[p];
  }

  return str;
}
class Transaction {
  constructor(resolver, context) {
    this._context = context;
    this._isFinished = false;
    this._resolver = resolver;
  }

  async insertGraph(source, graph, opts) {
    if (this._isFinished) {
      throw new Error('Transaction already finished');
    }

    return this._resolver.insertGraph(source, graph, opts, this._context);
  }

  async selectGraph(source, query, ...relations) {
    if (this._isFinished) {
      throw new Error('Transaction already finished');
    }

    return this._resolver.selectGraph(source, query, ...relations);
  }

  async upsertGraph(source, graph, opts) {
    if (this._isFinished) {
      throw new Error('Transaction already finished');
    }

    return this._resolver.upsertGraph(source, graph, opts, this._context);
  }

  commit() {
    this._isFinished = true;

    return this._context.commit();
  }

  rollback() {
    this._isFinished = true;

    return this._context.rollback();
  }
}

module.exports = {
  Transaction,
};

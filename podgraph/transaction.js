class Transaction {
  constructor(resolver, operationContext) {
    this._isFinished = false;
    this._operationContext = operationContext;
    this._resolver = resolver;
  }

  async insertGraph(source, graph, opts) {
    if (this._isFinished) {
      throw new Error('Transaction already finished');
    }

    return this._resolver.insertGraph(source, graph, opts, this._operationContext);
  }

  async selectCompact(source, query, ...relations) {
    if (this._isFinished) {
      throw new Error('Transaction already finished');
    }

    return this._resolver.selectCompact(source, query, ...relations);
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

    return this._resolver.upsertGraph(source, graph, opts, this._operationContext);
  }

  commit() {
    this._isFinished = true;

    return this._operationContext.commit();
  }

  rollback() {
    this._isFinished = true;

    return this._operationContext.rollback();
  }
}

module.exports = {
  Transaction,
  DEFAULT: 'default',
  READ_COMMITTED: 'readCommitted',
  READ_UNCOMMITTED: 'readUncommitted',
  REPEATABLE: 'repeatable',
  SERIALIZABLE: 'serializable',
};

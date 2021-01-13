const nextId = (() => {
  let id = 1000000;

  return function () {
    return id += 1;
  };
})();

class OperationContext {
  get transactions() {
    if (!this._transactions) {
      this._transactions = new Map();
    }

    return this._transactions;
  }

  constructor(name, opts) {
    this.id = nextId();
    this.name = name;
    this.opts = opts;
  }

  getTransaction(source) {
    return this.transactions.get(`${source.type}:${this.id}`);
  }

  setTransaction(source, transaction) {
    this.transactions.set(`${source.type}:${this.id}`, transaction);
  }

  hasTransaction(source) {
    return this.transactions.has(`${source.type}:${this.id}`);
  }

  commit() {
    for (const transaction of this.transactions.values()) {
      transaction.commit();
    }

    this.transactions.clear();
  }

  rollback() {
    for (const transaction of this.transactions.values()) {
      transaction.rollback();
    }

    this.transactions.clear();
  }
}

module.exports = {
  OperationContext,
};

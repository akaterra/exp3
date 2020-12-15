const nextId = (() => {
  let id = 1000000;

  return function () {
    return id ++;
  };
})();

class Context {
  constructor(operationName) {
    this.operationId = nextId();
    this.operationName = operationName;
    this.transactions = new Map();
  }

  getTransaction(source) {
    return this.transactions.get(`${source.type}:${this.operationId}`);
  }

  setTransaction(source, transaction) {
    this.transactions.set(`${source.type}:${this.operationId}`, transaction);
  }

  hasTransaction(source) {
    return this.transactions.has(`${source.type}:${this.operationId}`);
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
  Context,
};

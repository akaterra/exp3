import { SubjectWithCache } from './subject_with_cache';

export class Debug extends SubjectWithCache {
  constructor() {
    super();

    this._flows = new Map();
    this._roots = new Map();
  }

  setLastIncoming(flow, payload) {
    if (this._flows.has(flow)) {
      this._flows.get(flow).setLastIncoming(payload);

      this.next({ action: null, data: this.toJSON() });
    }

    return this;
  }

  setLastOutgoing(flow, payload) {
    if (this._flows.has(flow)) {
      this._flows.get(flow).setLastOutgoing(payload);

      this.next({ action: null, data: this.toJSON() });
    }

    return this;
  }

  setOp(flow, op) {
    if (this._flows.has(flow)) {
      this._flows.get(flow).setOp(op);

      this.next({ action: null, data: this.toJSON() });
    }

    return this;
  }

  add(flow, parentFlow) {
    let rootNode = this._flows.get(parentFlow);

    if (!rootNode) {
      rootNode = new DebugNode(parentFlow);

      this._roots.set(parentFlow, this._flows.set(parentFlow, rootNode).get(parentFlow));

      this.next({ action: null, data: this.toJSON() });
    }

    if (!rootNode.has(flow)) {
      let flowNode = this._flows.set(flow, new DebugNode(flow)).get(flow);

      rootNode.add(flow, flowNode);

      this.next({ action: null, data: this.toJSON() });
    }

    return this;
  }

  remove(flow, parentFlow) {
    if (this._flows.has(parentFlow)) {
      this._flows.get(parentFlow).remove(flow);

      this.next({ action: null, data: this.toJSON() });
    }

    if (this._flows.has(flow)) {
      this._flows.delete(this._flows.get(flow).clear());

      this.next({ action: null, data: this.toJSON() });
    }

    return this;
  }

  toJSON() {
    const flows = {};

    for (const flow of this._roots.entries()) {
      flows[Object.getPrototypeOf(flow[0]).constructor.name] = flow[1].toJSON();
    }

    return {
      flows,
    };
  }
}

export class DebugNode {
  constructor(flow) {
    this._flow = flow;
    this._flows = new Map();
  }

  setLastIncoming(payload) {
    this._lastIncoming = payload;

    return this;
  }

  setLastOutgoing(payload) {
    this._lastOutgoing = payload;

    return this;
  }

  setOp(op) {
    this._mode = op;

    return this;
  }

  clear() {
    for (const node of this._flows) {
      node.clear();
    }

    this._flow = this._flows.clear();

    return this;
  }

  has(flow) {
    return this._flows.has(flow);
  }

  add(flow, flowNode) {
    this._flows.set(flow, flowNode);
  }

  remove(flow) {
    this._flows.delete(flow);
  }

  toJSON() {
    const flows = {};

    for (const flow of this._flows.entries()) {
      flows[Object.getPrototypeOf(flow[0]).constructor.name] = flow[1].toJSON();
    }

    return {
      flows,
      lastIncoming: this._lastIncoming || null,
      lastOutgoing: this._lastOutgoing || null,
      op: this._mode || null,
    };
  }
}

export const debug = new Debug();

// debug.add('123');
// debug.add('333', '123');
// debug.add('444', '123');

// console.log(debug.toJSON());

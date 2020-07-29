import { SubjectWithCache } from './subject_with_cache';

export class Debug extends SubjectWithCache {
  constructor() {
    super();

    this._flowNodes = new Map();
    this._root = new DebugNode();
  }

  setMode(flow, mode) {
    if (this._flowNodes.has(flow)) {
      this._flowNodes.get(flow).setMode(mode);

      this.next({ action: null, data: this.toJSON() });
    }

    return this;
  }

  add(flow, parent) {
    let rootNode = !parent ? this._root : this._flowNodes.get(parent);

    if (!rootNode) {
      this._root = rootNode = new DebugNode(parent);

      this._flowNodes.set(parent, rootNode);

      this.next({ action: null, data: this.toJSON() });
    }

    if (!rootNode.has(flow)) {
      let flowNode = new DebugNode(flow);

      rootNode.add(flowNode);

      this.next({ action: null, data: this.toJSON() });
    }

    return this;
  }

  remove(flow) {
    if (this._flowNodes.has(flow)) {
      this._flowNodes.delete(this._flowNodes.get(flow).clear());

      this.next({ action: null, data: this.toJSON() });
    }

    return this;
  }

  toJSON() {
    return {
      root: this._root.toJSON(),
    };
  }
}

export class DebugNode {
  constructor(flow) {
    this._flow = flow;
    this._nodes = new Set();
  }

  setMode(mode) {
    this._mode = mode;
  }

  clear() {
    for (const node of this._nodes) {
      node.clear();
    }

    this._flow = this._nodes.clear();

    return this;
  }

  has(flow) {
    return this._nodes.has(flow);
  }

  add(flow) {
    this._nodes.add(flow);
  }

  remove(flow) {
    this._nodes.delete(flow);
  }

  toJSON() {
    const nodes = {};

    for (const node of this._nodes.entries()) {
      nodes[Object.getPrototypeOf(node[0]._flow).constructor.name] = node[1].toJSON();
    }

    return {
      mode: this._mode,
      nodes,
    };
  }
}

export const debug = new Debug();

// debug.add('123');
// debug.add('333', '123');
// debug.add('444', '123');

// console.log(debug.toJSON());

export class Debug {
  constructor() {
    this._flowNodes = new Map();
    this._root = new DebugNode();
  }

  setMode(flow, mode) {
    if (this._flowNodes.has(flow)) {
      this._flowNodes.get(flow).setMode(mode);
    }

    return this;
  }

  add(flow, parent) {
    let rootNode = !parent ? this._root : this._flowNodes.get(parent);

    if (!rootNode) {
      rootNode = new DebugNode(parent);

      this._flowNodes.set(parent, rootNode);
    }

    if (!rootNode.has(flow)) {
      let flowNode = new DebugNode(flow);

      rootNode.add(flowNode);console.log(this);
    }

    return this;
  }

  remove(flow) {
    if (this._flowNodes.has(flow)) {
      this._flowNodes.delete(this._flowNodes.get(flow).clear());
    }

    return this;
  }
}

export class DebugNode {
  constructor(flow) {
    this.flow = flow;
    this.nodes = new Set();
  }

  setMode(mode) {
    this.mode = mode;
  }

  clear() {
    for (const node of this.nodes) {
      node.clear();
    }

    this.flow = this.nodes.clear();

    return this;
  }

  has(flow) {
    return this.nodes.has(flow);
  }

  add(flow) {
    this.nodes.add(flow);
  }

  remove(flow) {
    this.nodes.delete(flow);
  }
}

export const debug = new Debug();

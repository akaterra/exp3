export class SubjectWithCache extends Subject {
  get data() {
    return this._data && this._data.data;
  }

  get action() {
    return this._data && this._data.action;
  }

  setData(data) {
    this._data = data;

    for (const observer of this.observers) {
      observer.next(data);
    }

    return this;
  }

  subscribe(...args) {
    const subscription = super.subscribe(...args);

    if (this._data !== undefined) {
      subscription.next(this._data);
    }

    return subscription;
  }

  toImmediatePromise(resolveCached) {
    if (resolveCached && this._data !== undefined) {
      return Promise.resolve(this._data);
    }

    return toPromise(this);
  }
}

export class Flow extends Subject {
  constructor() {
    super();

    this._incoming = new Subject();
    this._outgoing = new Subject();
    this._pipes = [];
    this._streams = new Map();
  }

  getStream(name) {
    if (!this._streams.has(name)) {
      this._streams.set(name, new SubjectWithCache());
    }

    return this._streams.get(name);
  }

  emit(data) {
    this._outgoing.next(data);

    return this;
  }

  emitAction(action, data) {
    this._outgoing.next({ action, data });

    return this;
  }

  filter(...actions) {
    const stream = this._outgoing.pipe(filter(({ action }) => actions.includes(action)));

    return stream;
  }

  send(data) {
    this._incoming.next(data);

    return this;
  }

  sendAction(action, data) {
    this._incoming.next({ action, data });

    return this;
  }
  
  async run() {

  }

  incomingPushTo(flow) {
    this._pipes.push(this._incoming.subscribe(flow));

    return flow;
  }

  toOutgoingPull(flow) {
    this._pipes.push(flow.subscribe(this._outgoing));

    return flow;
  }

  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  subscribe(...args) {
    return this._outgoing.subscribe(...args);
  }

  unpipe() {
    this._pipes.forEach((pipe) => pipe.unsubscribe());

    return this;
  }
  
  wait() {
    return toPromise(this._incoming);
  }

  waitFor(...actions) {
    return toPromise(this._incoming.pipe(filter(({ action }) => actions.includes(action))));
  }
}

import { Subject, merge } from 'rxjs';
import { filter, first } from 'rxjs/operators';

export class SubjectWithCache extends Subject {
  get action() {
    return this._data && this._data.action;
  }

  get data() {
    return this._data && this._data.data;
  }

  setData(data) {
    this._data = data;

    for (const observer of this.observers) {
      observer.next(data);
    }

    return this;
  }

  subscribe(...args) {
    const subscriber = super.subscribe(...args);

    if (this._data !== undefined) {
      subscriber.next(this._data);
    }

    return subscriber;
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

  getStream(name, onCreate) {
    if (!this._streams.has(name)) {
      const stream = new SubjectWithCache();

      this._streams.set(name, stream);

      if (onCreate) {
        onCreate(stream);
      }
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

  sendComplete(data) {
    this._incoming.complete();

    return this;
  }

  sendError(data) {
    this._incoming.error(data);

    return this;
  }

  async run() {

  }

  outgoingPushTo(flow) {
    this._pipes.push(this._outgoing.subscribe((data) => flow.send(data)));

    return flow;
  }

  toIncomingPull(flow) {
    this._pipes.push(flow.subscribe(this._incoming));

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
    this._pipes = [];
    return this;
  }
  
  wait(...mixed) {
    if (!mixed.length) {
      return toPromise(this._incoming);
    }

    let flows = mixed.filter((flow) => flow instanceof Subject);

    if (flows.length === 0) {
      flows = mixed = [this._incoming];
    }

    let actions = flows.length < mixed.length ? mixed.filter((flow) => !(flow instanceof Subject)) : null;

    if (actions && actions.length) {
      return toPromise(merge(...flows).pipe(filter(({ action }) => actions.includes(action)), first()));
    }

    return toPromise(merge(...flows).pipe(first()));
  }
}

export function getFirst(stream) {
  return stream.pipe(first());
}

export function toPromise(stream) {
  return stream.pipe(first()).toPromise();
}

import { BehaviorSubject, Subject, merge } from 'rxjs';
import { filter, first } from 'rxjs/operators';

export class SubjectWithCache extends BehaviorSubject {
  get action() {
    return this._data && this._data.action;
  }

  get data() {
    return this._data && this._data.data;
  }

  next(data) {
    this._data = data;

    return super.next(data);
  }

  pipe(...pipes) {
    pipes.unshift(filter(isNotUndefined));

    return super.pipe(...pipes);
  }

  toImmediatePromise(resolveCached) {
    if (resolveCached && this._data !== undefined) {
      return Promise.resolve(this._data);
    }

    return toPromise(this);
  }
}

export class FlowSubscription {
  constructor(subscriptions) {
    this._subscriptions = subscriptions;
  }

  unsubscribe() {
    for (const subscription of this._subscriptions) {
      subscription.unsubscribe();
    }

    return this;
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
      stream.name = name;

      this._streams.set(name, stream);

      if (onCreate) {
        onCreate(stream);
      }
    }

    return this._streams.get(name);
  }

  complete(data) {
    this._incoming.complete();

    return this;
  }

  emit(data) {
    this._outgoing.next(data);

    return this;
  }

  emitAction(action, data) {
    this._outgoing.next({ action, data });

    return this;
  }

  error(data) {
    this._incoming.error(data);

    return this;
  }

  filterAction(...actions) {
    const stream = this._outgoing.pipe(filter(({ action }) => actions.includes(action)));

    return stream;
  }

  next(data) {
    this._incoming.next(data);

    return this;
  }

  nextAction(action, data) {
    this._incoming.next({ action, data });

    return this;
  }

  async run() {

  }

  outgoingPushTo(flow) {
    this._pipes.push(this._outgoing.subscribe(flow));

    return this;
  }

  toIncomingPull(flow) {
    this._pipes.push(flow.subscribe(this._incoming));

    return this;
  }

  redirectTo(flow) {
    return new FlowSubscription(this._incoming.subscribe(flow), flow.subscribe(this._outgoing));
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

export function isNotUndefined(val) {
  return val !== undefined;
}

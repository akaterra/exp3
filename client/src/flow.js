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
  constructor(...subscriptions) {
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

  next(data) {
    this._incoming.next(data);

    return this;
  }

  nextAction(action, data) {
    this._incoming.next({ action, data });

    return this;
  }

  async run() {
    await this.onRunInit();

    let action;
    let data;

    while (true) {
      try {
        ({ action, data } = await this.wait());

        let result = await this.onRunIterAction(action, data);

        while (typeof result === 'object') {
          result = await this.onRunIterAction(result.action, result.data);
        }

        if (result === false) {
          break;
        }
      } catch (error) {
        this.emitAction('error', { error });
      }
    }

    // this._incoming.complete();
    // this._outgoing.complete();

    return { action, data };
  }

  async onRunIterAction(action, data) {
    
  }

  async onRunInit() {

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

  wait(...mixed) {
    return !mixed.length ? toPromise(this._incoming) : toPromise(filterAction(this._incoming, ...mixed));
  }
}

export function getFirst(stream) {
  return stream.pipe(first());
}

export function filterAction(...mixed) {
  let flows = mixed.filter((flow) => flow instanceof Subject);

  if (flows.length === 0) {
    return null;
  }

  let actions = flows.length < mixed.length ? mixed.filter((flow) => !(flow instanceof Subject)) : null;

  if (actions && actions.length) {
    return merge(...flows).pipe(filter(({ action }) => actions.includes(action)));
  }

  return merge(...flows);
}

export function isNotUndefined(val) {
  return val !== undefined;
}

export function toPromise(stream) {
  return stream.pipe(first()).toPromise();
}

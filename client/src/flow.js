import { Subject, merge } from 'rxjs';
import { filter, first, skip } from 'rxjs/operators';
import { Streamable } from './streamable';
import { SubjectWithCache } from './subject_with_cache';
import { debug } from './debug';

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

export class Flow extends Streamable {
  constructor() {
    super();

    this._incoming = new Subject();
    this._outgoing = new Subject();
  }

  // incoming

  next(data) {
    this._incoming.next(data);

    debug.setLastIncoming(this, data);

    return this;
  }

  nextAction(action, data) {
    this._incoming.next({ action, data });

    debug.setLastIncoming(this, { action, data });

    return this;
  }

  complete(data) {
    this._incoming.complete();

    return this;
  }

  error(err) {
    this._incoming.error(err);

    return this;
  }

  // outgoing

  emit(data) {
    this._outgoing.next(data);

    debug.setLastOutgoing(this, data);

    return this;
  }

  emitAction(action, data) {
    this.getStream(action)
      .next({ action, data });

    this._outgoing
      .next({ action, data });

    debug.setLastOutgoing(this, { action, data });

    return this;
  }

  emitComplete() {
    this._outgoing.complete();

    return this;
  }

  emitError(err) {
    this._outgoing.error(err);

    return this;
  }

  // run cycle

  async run(...args) {
    const name = Object.getPrototypeOf(this).constructor.name;

    console.log('>>>>>', name, 'run');

    await this.onRunInit(...args);

    let action;
    let data;

    while (true) {
      try {
        ({ action, data } = await this.onRunIterWait());

        console.log('>>>>>', name, 'action', { action, data });

        let result = await this.onRunIterAction(action, data);

        while (typeof result === 'object') {
          action = result.action;
          data = result.data;
          result = await this.onRunIterAction(action, data);
        }

        if (result === false) {
          break;
        }
      } catch (error) {
        this.emitAction('error', { status: 0, error });
      }
    }

    // this._incoming.complete();
    // this._outgoing.complete();

    this.complete();

    console.log('>>>>>', name, 'complete', { action, data });

    return { action, data };
  }

  async onRunInit(...args) {

  }

  async onRunIterAction(action, data) {
    
  }

  async onRunIterWait() {
    return this.wait();
  }

  outgoingPushTo(flow) {
    this._outgoing.subscribe(flow);

    return this;
  }

  toIncomingPull(flow) {
    flow.subscribe(this._incoming);

    return this;
  }

  redirectTo(flow) {
    return new FlowSubscription(this._incoming.subscribe(flow), flow.subscribe(this._outgoing));
  }

  redirectToAndRun(flow, ...args) {
    debug.add(flow, this);
    debug.setOp(this, `redirectToAndRun : ${Object.getPrototypeOf(flow).constructor.name}`);

    const flowSubscription = new FlowSubscription(this._incoming.subscribe(flow), flow.subscribe(this._outgoing));

    return flow.run(...args).then((result) => {
      flowSubscription.unsubscribe();
      
      debug.remove(flow, this);
      debug.setOp(this, null);

      return result;
    }).catch((err) => {
      flowSubscription.unsubscribe();

      debug.remove(flow, this);
      debug.setOp(this, null);

      return Promise.reject(err);
    })
  }

  sleep(ms) {
    debug.setOp(this, 'sleep');

    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  subscribe(...args) {
    return this._outgoing.subscribe(...args);
  }

  wait(...mixed) {
    debug.setOp(this, `wait : ${mixed.map((m) => m instanceof Subject ? Object.getPrototypeOf(m).constructor.name : m).join(',')}`);

    return (!mixed.length
      ? toPromise(this._incoming)
      : toPromise(filterAction(this._incoming, ...mixed))
    ).then((res) => {
      debug.setOp(this, undefined);

      return res;
    }).catch((e) => {
      debug.setOp(this, undefined);

      return Promise.reject(e);
    });
  }
}

export function getFirst(stream) {
  return stream instanceof SubjectWithCache && stream._dataIsSet
    ? stream.pipe(skip(1), first())
    : stream.pipe(first());
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

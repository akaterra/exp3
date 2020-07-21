import { Subject, merge } from 'rxjs';
import { filter, first, skip } from 'rxjs/operators';
import { Streamable } from './streamable';
import { SubjectWithCache } from './subject_with_cache';

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

    this._modeActionSubscription = filterAction(this._outgoing, 'mode').subscribe(_ => this.getStream('mode').next(_));
  }

  // incoming

  next(data) {
    this._incoming.next(data);

    return this;
  }

  nextAction(action, data) {
    this._incoming.next({ action, data });

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

    return this;
  }

  emitAction(action, data) {
    this._outgoing.next({ action, data });

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

    this._modeActionSubscription.unsubscribe();

    return { action, data };
  }

  async onRunIterAction(action, data) {
    
  }

  async onRunInit() {

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
    const flowSubscription = new FlowSubscription(this._incoming.subscribe(flow), flow.subscribe(this._outgoing));

    return flow.run(...args).then((result) => {
      flowSubscription.unsubscribe();

      return result;
    }).catch((err) => {
      flowSubscription.unsubscribe();

      throw err;
    })
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

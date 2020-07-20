import { BehaviorSubject, Subject, merge } from 'rxjs';
import { filter, first, skip } from 'rxjs/operators';

export class SubjectWithCache extends BehaviorSubject {
  get action() {
    return this._data && this._data.action;
  }

  get data() {
    return this._data && this._data.data;
  }

  next(data) {
    this._data = data;
    this._dataIsSet = true;
    return super.next(data);
  }

  pipe(...pipes) {
    pipes.unshift(filter(isNotUndefined));

    return super.pipe(...pipes);
  }

  toPromise(resolveCached) {
    return resolveCached && this._data !== undefined
      ? Promise.resolve(this._data)
      : toPromise(this);
  }
}

export function isNotUndefined(val) {
  return val !== undefined;
}

export function toPromise(stream) {
  return stream.pipe(first()).toPromise();
}

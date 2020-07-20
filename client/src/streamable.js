import { BehaviorSubject, Subject } from 'rxjs';
import { SubjectWithCache } from './subject_with_cache';

export class Streamable extends Subject {
  constructor(subjectCls) {
    super();

    this._streams = new Map();
    this._subjectClass = subjectCls || SubjectWithCache;
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
}

export function toPromise(stream) {
  return stream.pipe(first()).toPromise();
}

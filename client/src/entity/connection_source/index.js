import { filter, map } from 'rxjs/operators';
import { default as Component } from './component';
import { default as _ } from './const';
import { Flow, getFirst, filterAction } from '../../flow';

export default class ConnectionSourceFlow extends Flow {
  get mode() {
    return filterAction(this._outgoing, _.MODE);
  }

  constructor(api, db, schema, source) {
    super();

    this._api = api;
    this._db = db;
    this._schema = schema;
    this._source = source;
  }

  async run() {
    await this;

    this.emit({ data: null });
    
    while (true) {
      let { action, data } = await this.wait();

      console.log({ action, data }, 'run source');

      switch (action) {
        default:
          return { action, data };
      }
    }
  }
}

ConnectionSourceFlow._ = _;
ConnectionSourceFlow.Component = Component;

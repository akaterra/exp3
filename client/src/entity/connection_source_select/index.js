import { filter, map } from 'rxjs/operators';
import { default as Component } from './component';
import { default as _ } from './const';
import { Flow, getFirst, filterAction } from '../../flow';

export default class ConnectionSourceSelectFlow extends Flow {
  get mode() {
    return filterAction(this._outgoing, _MODE);
  }

  constructor(api, db, schema, source) {
    super();

    this._api = api;
    this._db = db;
    this._schema = schema;
    this._source = source;
  }

  async run() {
    await this.selectRowsSet().toImmediatePromise();

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

  // current source

  selectRowsSet(query) {
    getFirst(this._api.sourceSelect(this._db, this._schema, this._source, query)).subscribe((data) => {
      this.data.next(data);
    });

    return this.data;
  }
}

ConnectionSourceSelectFlow._ = _;
ConnectionSourceSelectFlow.Component = Component;

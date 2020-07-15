import { filter, map } from 'rxjs/operators';
import { default as Component } from './component';
import { default as _ } from './const';
import { Flow, getFirst, filterAction } from '../../flow';

export default class ConnectionSourceSelectFlow extends Flow {
  get data() {
    return this.getStream('data');
  }

  get mode() {
    return filterAction(this._outgoing, _MODE);
  }

  set data(data) {
    this.emitAction('source:select:data', data.data).data.next({ action: 'source:select:data', data: data.data });
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
      this.data = data;
    });

    return this.data;
  }
}

ConnectionSourceSelectFlow._ = _;
ConnectionSourceSelectFlow.Component = Component;

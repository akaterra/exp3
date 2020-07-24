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

  async onRunInit(...args) {
    this.emitAction('source', this._source);
  }

  async onRunIterAction(action, data) {
    switch (action) {
      default:
        return false;
    }
  }

  // current source

  select(query) {
    getFirst(this._api.selectSource(this._db, this._schema, this._source, query)).subscribe((data) => {
      this.data = data;
    });

    return this.data;
  }
}

ConnectionSourceFlow._ = _;
ConnectionSourceFlow.Component = Component;

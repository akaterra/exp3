import { default as Component } from './component';
import { default as _ } from './const';
import { Flow, getFirst, filterAction } from '../../flow';

export default class ConnectionSourceSelectFlow extends Flow {
  get data() {
    return this.getStream('data');
  }

  get mode() {
    return filterAction(this._outgoing, _.MODE);
  }

  set data(data) {
    this.emitAction('source:select:data', data.data).data.next({ action: 'source:select:data', data: data.data });
  }

  constructor(api, db, schema, source) {
    super();

    this._api = api;
    this._db = db;
    this._query = { limit: 20, offset: 0 };
    this._schema = schema;
    this._source = source;
  }

  async run() {
    await this.selectRowsSet().toImmediatePromise();

    this.emit({ data: null });
    this.emitAction('source:select:filter', this._query);
    
    while (true) {
      let { action, data } = await this.wait();

      console.log({ action, data }, 'run source select');

      switch (action) {
        case 'source:select:filter':
          Object.assign(this._query, data);
          this.emitAction('source:select:filter', this._query);

          this.selectRowsSet(this._query);

          break;
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
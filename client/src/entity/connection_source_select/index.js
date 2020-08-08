import { default as Component } from './component';
import { default as _ } from './const';
import { Flow, getFirst, filterAction } from '../../flow';

export default class ConnectionSourceSelectFlow extends Flow {
  get data() {
    return this.getStream('source:select:data');
  }

  set data(data) {
    this.emitAction('source:select:data', data.data);
  }

  constructor(api, db, schema, source) {
    super();

    this._api = api;
    this._db = db;
    this._query = { limit: 25, offset: 0 };
    this._schema = schema;
    this._source = source;
  }

  async onRunInit() {
    await this.selectRowsSet(this._query).toPromise();

    this.emitAction(_.MODE, 'source:select').emitAction('source:select:filter', this._query);
  }

  async onRunIterAction(action, data) {
    switch (action) {
      case 'source:current:select':
        await this.setSource(data).selectRowsSet(this._query).toPromise();
        this.emitAction('source:current:select', data);

        this.selectRowsSet(this._query);

        break;
      case 'source:select:filter':
        Object.assign(this._query, data);
        this.emitAction('source:select:filter', this._query);

        this.selectRowsSet(this._query);

        break;
      default:
        return false;
    }
  }

  setSource(source) {
    this._source = source;

    return this;
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

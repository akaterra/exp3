import { filter, map } from 'rxjs/operators';
import { default as Component } from './component';
import { default as _ } from './const';
import { Flow, getFirst, filterAction } from '../../flow';
import { default as ConnectionSourceSelectFlow} from '../connection_source_select';

export default class ConnectionSourceFlow extends Flow {
  get data() {
    return this.getStream('source:data');
  }

  set data(data) {
    this.emitAction('source:data', data.data);
  }

  constructor(api, db, schema, source) {
    super();

    this._api = api;
    this._db = db;
    this._schema = schema;
    this._source = source;
  }

  async onRunInit(...args) {
    await this.select().toPromise();

    this.emitAction(_.MODE, 'source');
  }

  async onRunIterAction(action, data) {
    switch (action) {
      case 'mode':
        switch (data) {
          case 'source:select':
            const connectionSourceFlow = new ConnectionSourceSelectFlow(
              this._api,
              this._db,
              this._schema,
              this._source,
            );
    
            return await this.redirectToAndRun(connectionSourceFlow);
        }

        break;
      default:
        return false;
    }
  }

  // current source

  select(query) {
    getFirst(this._api.selectSource(this._db, this._schema, this._source)).subscribe((data) => {
      this.data = data;
    });

    return this.data;
  }
}

ConnectionSourceFlow._ = _;
ConnectionSourceFlow.Component = Component;

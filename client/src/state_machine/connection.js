import { Subject } from 'rxjs';
import { filter, first, map, take } from 'rxjs/operators';
import { default as _ } from './const';

export class SubjectWithCache extends Subject {
  get data() {
    return this._data && this._data.data;
  }

  get action() {
    return this._data && this._data.action;
  }

  setData(data) {
    this._data = data;

    for (const observer of this.observers) {
      observer.next(data);
    }

    return this;
  }

  subscribe(...args) {
    const subscription = super.subscribe(...args);

    if (this._data !== undefined) {
      subscription.next(this._data);
    }

    return subscription;
  }

  toImmediatePromise(resolveCached) {
    if (resolveCached && this._data !== undefined) {
      return Promise.resolve(this._data);
    }

    return toPromise(this);
  }
}

export class StateMachine extends Subject {
  constructor() {
    super();

    this._incoming = new Subject();
    this._outgoing = new Subject();
    this._pipes = [];
    this._streams = new Map();
  }

  getStream(name) {
    if (!this._streams.has(name)) {
      this._streams.set(name, new SubjectWithCache());
    }

    return this._streams.get(name);
  }

  emit(data) {
    this._outgoing.next(data);

    return this;
  }

  emitAction(action, data, extra) {
    this._outgoing.next({ action, data, extra });

    return this;
  }

  filter(...actions) {
    const stream = this._outgoing.pipe(filter(({ action }) => actions.includes(action)));

    return stream;
  }

  next(data) {
    this._incoming.next(data);

    return this;
  }
  
  async run() {

  }

  incomingPushTo(stateMachine) {
    this._pipes.push(this._incoming.subscribe(stateMachine));

    return stateMachine;
  }

  toOutgoingPull(stateMachine) {
    this._pipes.push(stateMachine.subscribe(this._outgoing));

    return stateMachine;
  }

  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  subscribe(...args) {
    return this._outgoing.subscribe(...args);
  }

  unpipe() {
    this._pipes.forEach((pipe) => pipe.unsubscribe());

    return this;
  }
  
  wait() {
    return toPromise(this._incoming);
  }

  waitFor(...actions) {
    return toPromise(this._incoming.pipe(filter(({ action }) => actions.includes(action))));
  }
}

export default class ConnectionStateMachine extends StateMachine {
  get currentDb() {
    return this.getStream('db:current');
  }

  set currentDb(data) {
    this.getStream('db:current').setData(data);
  }

  get currentDbs() {
    return this.getStream('db:current:list');
  }

  get currentDbsNames() {
    return this.currentDbs.pipe(map(({ data }) => ({ data: Object.values(data).map(_ => _.name).sort() })));
  }

  get currentSchema() {
    return this.getStream('schema:current');
  }

  set currentSchema(data) {
    this.getStream('schema:current').setData(data);
  }

  get currentSchemas() {
    return this.getStream('schema:current:list');
  }

  get currentSchemasNames() {
    return this.currentSchemas.pipe(map(({ data }) => ({ data: Object.values(data).map(_ => _.name).sort() })));
  }

  get currentSource() {
    return this.getStream('source:current');
  }

  set currentSource(data) {
    this.getStream('source:current').setData(data);
  }

  get currentSources() {
    return this.getStream('source:current:list');
  }

  get currentSourcesNames() {
    return this.currentSources.pipe(map(({ data }) => ({ data: Object.values(data).map(_ => _.name).sort() })));
  }

  get mode() {
    return this.filter(_.MODE);
  }

  constructor(api) {
    super();

    this._api = api;
  }

  async run() {
    await this.sleep(1);
    await this.selectCurrentDbs().toImmediatePromise();

    this.emitAction(_.MODE, _.DB_LIST);

    while (true) {
      let { action, data } = await this.waitFor(_.DB_CURRENT_SELECT, _.SCHEMA_CURRENT_SELECT, _.SOURCE_CURRENT_SELECT);
      let brk;

      do {
        brk = true;

        console.log({ action, data }, 'run connection');

        switch (action) {
          case _.CONNECTION_CLOSE:
            this.emitAction(action);

            return { action };
          case _.DB_CURRENT_SELECT:
            this.currentDb = { data };

            if (this.currentDb.data === _.ROOT) {
              this.emitAction(_.MODE, _.DB_LIST);
            } else {
              await toPromise(this.selectCurrentSchemasFor(this.currentDb.data));

              this.emitAction(_.MODE, Object.keys(this.currentSchemas.data).length > 1 ? _.SCHEMA_LIST : _.SOURCE_LIST);
            }

            break;
          case _.SCHEMA_CURRENT_SELECT:
            this.currentSchema = { data };

            if (this.currentSchema.data === _.ROOT && Object.keys(this.currentSchemas.data) > 1) {
              this.emitAction(_.MODE, _.SCHEMA_LIST);
            } else {
              await toPromise(this.selectCurrentSourcesFor(this.currentSchema.data));

              this.emitAction(_.MODE, _.SOURCE_LIST);
            }

            break;
          case _.SOURCE_CURRENT_SELECT:
            this.currentSource = { data };

            if (data === _.ROOT) {
              this.emitAction(_.MODE, _.SOURCE_LIST);
            } else {
              const sm = new SourceStateMachine(this._api, this.currentDb.data, this.currentSchema.data, this.currentSource.data);

              this.emitAction(_.MODE, 'source');
              this.emitAction('api', this.incomingPushTo(sm));

              try {
                const result = await sm.run();

                if (result) {
                  action = result.action;
                  data = result.data;
                  brk = false;
                }
              } catch (e) {

              }

              this.unpipe();
            }

            break;
        }
      } while (!brk);
    }

    return { action: 'completed' };
  }

  // actions

  actSelectCurrentDb(dbName) {
    this.next({ action: _.DB_CURRENT_SELECT, data: dbName });

    return this;
  }

  actSelectCurrentSchema(schemaName) {
    this.next({ action: _.SCHEMA_CURRENT_SELECT, data: schemaName });

    return this;
  }

  actSelectCurrentSource(sourceName) {
    this.next({ action: _.SOURCE_CURRENT_SELECT, data: sourceName });

    return this;
  }

  // db

  dbs() {
    return this._api.getStream('db');
  }

  selectCurrentDbs(refresh) {
    this._api.selectDbs(refresh).pipe(first()).subscribe((data) => {
      this.currentDb = { data: _.ROOT };
      this.currentDbs.setData(data);
      this.selectCurrentSchemasFor(_.ROOT);
    });

    return this.currentDbs;
  }

  selectCurrentDbsFor(refresh) {
    // this.currentDb = { data: dbName };

    return this.selectCurrentDbs(refresh);
  }

  selectDbs() {
    return this._api.selectDbs();
  }

  // schema

  schemas(dbName) {
    return this._api.getStream(`db/${dbName}/schema`);
  }

  selectCurrentSchemas(refresh) {
    this._api.selectSchemas(this.currentDb.data, refresh).pipe(first()).subscribe((data) => {
      this.currentSchema = { data: _.ROOT };
      this.currentSchemas.setData(data);
      this.selectCurrentSourcesFor(_.ROOT);
    });

    return this.currentSchemas;
  }

  selectCurrentSchemasFor(dbName, refresh) {
    this.currentDb = { data: dbName };

    return this.selectCurrentSchemas(refresh);
  }

  selectSchemas(dbName, refresh) {
    return this._api.selectSchemas(dbName, refresh);
  }

  // source

  sources(dbName, schemaName) {
    return this._api.getStream(`db/${dbName}/schema/${schemaName}/source`);
  }

  selectCurrentSources(refresh) {
    this._api.selectSources(this.currentDb.data, this.currentSchema.data, refresh).pipe(first()).subscribe((data) => {
      this.currentSource = { data: _.ROOT };
      this.currentSources.setData(data);
      // this.selectCurrentSourcesFor(_.ROOT);
    });

    return this.currentSources;
  }

  selectCurrentSourcesFor(schemaName, refresh) {
    this.currentSchema = { data: schemaName };

    return this.selectCurrentSources(refresh);
  }

  selectSources(dbName, schemaName, refresh) {
    return this._api.selectSources(dbName, schemaName, refresh);
  }
}

export class SourceStateMachine extends StateMachine {

  get onSelect() {
    return this.getStream('select');
  }

  get mode() {
    return this.filter(_.MODE);
  }

  constructor(api, db, schema, source) {
    super();

    this._api = api;
    this._db = db;
    this._schema = schema;
    this._source = source;
  }

  async run() {
    await this.sleep(1);
    await this.select().toImmediatePromise();

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

  select(query) {
    getFirst(this._api.sourceSelect(this._db, this._schema, this._source, query)).subscribe((data) => {
      this.onSelect.setData(data);
    });

    return this.onSelect;
  }

}

function getFirst(stream) {
  return stream.pipe(first());
}

function toPromise(stream) {
  return stream.pipe(first()).toPromise();
}

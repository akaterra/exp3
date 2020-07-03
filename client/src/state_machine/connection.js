import { Subject } from 'rxjs';
import { filter, first, map, take } from 'rxjs/operators';
import { default as _ } from './action';

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

  emitAction(action, data) {
    this._outgoing.next({ action, data });

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

  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  subscribe(...args) {
    return this._outgoing.subscribe(...args);
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

  get currentSourceSelect() {
    return this.getStream('source:current:select');
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

  constructor(api) {
    super();

    this._api = api;
  }

  async run() {
    await this.sleep(1);
    await this.selectCurrentDbs().toImmediatePromise();

    this.emit({ data: _.DB_LIST });

    while (true) {
      const { action, data } = await this.waitFor(_.DB_CURRENT_SELECT, _.SCHEMA_CURRENT_SELECT, _.SOURCE_CURRENT_SELECT);

      switch (action) {
        case _.CONNECTION_CLOSE:
          this.emitAction(action);

          return { action };
        case _.DB_CURRENT_SELECT:
          this.currentDb = { data };

          if (this.currentDb.data === '__ROOT__') {
            this.emitAction(_.DB_LIST);
          } else {
            await toPromise(this.selectCurrentSchemasFor(this.currentDb.data));

            this.emitAction(_.SCHEMA_LIST);
          }

          break;
        case _.SCHEMA_CURRENT_SELECT:
          this.currentSchema = { data };

          if (this.currentSchema.data === '__ROOT__') {
            this.emitAction(_.SCHEMA_LIST);
          } else {
            await toPromise(this.selectCurrentSourcesFor(this.currentSchema.data));

            this.emitAction(_.SOURCE_LIST);
          }

          break;
        case _.SOURCE_CURRENT_SELECT:
          this.currentSource = { data };

          if (data === '__ROOT__') {
            this.emitAction(_.SOURCE_LIST);
          } else {
            await toPromise(this.doCurrentSourceSelect({}));

            this.emitAction('source:select');
          }

          break;
      }
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

  // current source

  doCurrentSourceSelect(query) {
    getFirst(this._api.sourceSelect(this.currentDb.data, this.currentSchema.data, this.currentSource.data, query)).subscribe((data) => {
      this.currentSourceSelect.setData(data);
    });

    return this.currentSourceSelect;
  }

  // db

  dbs() {
    return this._api.getStream('db');
  }

  selectCurrentDbs(refresh) {
    this._api.selectDbs(refresh).pipe(first()).subscribe((data) => {
      this.currentDb = { data: '__ROOT__' };
      this.currentDbs.setData(data);
      this.selectCurrentSchemasFor('__ROOT__');
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
      this.currentSchema = { data: '__ROOT__' };
      this.currentSchemas.setData(data);
      this.selectCurrentSourcesFor('__ROOT__');
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
      this.currentSource = { data: '__ROOT__' };
      this.currentSources.setData(data);
      // this.selectCurrentSourcesFor('__ROOT__');
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

function getFirst(stream) {
  return stream.pipe(first());
}

function toPromise(stream) {
  return stream.pipe(first()).toPromise();
}

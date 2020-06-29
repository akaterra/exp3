import { Observable, Subject } from 'rxjs';
import { first } from 'rxjs/operators';

export class SubjectWithCache extends Subject {
  get data() {
    return this._data;
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
}

export class StateMachine {
  constructor() {
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

  next(data) {

  }
  
  async run() {

  }

  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  subcribe(...args) {
    this._outgoing.subscribe(...args);

    return this;
  }

  wait() {
    return this._incoming.toPromise();
  }

  waitFor(event) {
    return this._incoming.filter(({ event: incomingEvent }) => incomingEvent === event).toPromise();
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

  get currentSchema() {
    return this.getStream('schema:current');
  }

  set currentSchema(data) {
    this.getStream('schema:current').setData(data);
  }

  get currentSchemas() {
    return this.getStream('schema:current:list');
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

  get scope() {
    return this.getStream('scope');
  }

  constructor(api) {
    super();

    this._api = api;
  }

  async run() {
    await this.sleep(3000);
    await this.selectDbs().toPromise();

    this.scope.next({ data: 'db:list' });
  }

  // db

  dbs() {
    return this._api.getStream('db');
  }

  selectDbs() {
    return this._api.selectDbs();
  }

  // schema

  schemas(dbName) {
    return this._api.getStream(`db/${dbName}/schema`);
  }

  selectCurrentSchemas(refresh) {
    return this._api.selectSchemas(this.currentDb.data, refresh).pipe(first()).subscribe((data) => {
      this.currentSchema = '__ROOT__';
      this.currentSchemas.setData(data);
      this.selectCurrentSourcesFor('__ROOT__');
    });
  }

  selectCurrentSchemasFor(dbName, refresh) {
    this.currentDb = dbName;

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
    return this._api.selectSources(this.currentDb.data, this.currentSchema.data, refresh).pipe(first()).subscribe((data) => {
      this.currentSource = '__ROOT__';
      this.currentSources.setData(data);
      // this.selectCurrentSourcesFor('__ROOT__');
    });
  }

  selectCurrentSourcesFor(schemaName, refresh) {
    this.currentSchema = schemaName;

    return this.selectCurrentSources(refresh);
  }

  selectSources(dbName, schemaName, refresh) {
    return this._api.selectSources(dbName, schemaName, refresh);
  }
}

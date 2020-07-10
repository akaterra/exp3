import { map } from 'rxjs/operators';
import { default as Component } from './component';
import { default as _ } from './const';
import { Flow, getFirst, toPromise } from '../../flow';

export default class ConnectionFlow extends Flow {
  get currentDb() {
    return this.getStream('db:current');
  }

  set currentDb(data) {
    this.getStream('db:current').next(data);
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
    this.getStream('schema:current').next(data);
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
    this.getStream('source:current').next(data);
  }

  get currentSources() {
    return this.getStream('source:current:list');
  }

  get currentSourcesNames() {
    return this.currentSources.pipe(map(({ data }) => ({ data: Object.values(data).map(_ => _.name).sort() })));
  }

  get mode() {
    return this.filterAction(_.MODE);
  }

  constructor(api) {
    super();

    this._api = api;
  }

  async run() {
    await this.selectCurrentDbs().toImmediatePromise();

    this.emitAction(_.MODE, _.DB_LIST);

    while (true) {
      let { action, data } = await this.wait(_.DB_CURRENT_SELECT, _.SCHEMA_CURRENT_SELECT, _.SOURCE_CURRENT_SELECT);
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

            if (this.currentSchema.data === _.ROOT && Object.keys(this.currentSchemas.data).length > 1) {
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
              // const sm = new SourceStateMachine(this._api, this.currentDb.data, this.currentSchema.data, this.currentSource.data);

              // this.nextAction(_.MODE, 'source');
              // this.incomingPushTo(sm);

              // try {
              //   const result = await sm.run();

              //   if (result) {
              //     action = result.action;
              //     data = result.data;
              //     brk = false;
              //   }
              // } catch (e) {

              // }

              // this.unpipe();
            }

            break;
        }
      } while (!brk);
    }

    return { action: 'completed' };
  }

  // actions

  sendSelectCurrentDbAction(dbName) {
    this.next({ action: _.DB_CURRENT_SELECT, data: dbName });

    return this;
  }

  sendSelectCurrentSchemaAction(schemaName) {
    this.next({ action: _.SCHEMA_CURRENT_SELECT, data: schemaName });

    return this;
  }

  sendtSelectCurrentSourceAction(sourceName) {
    this.next({ action: _.SOURCE_CURRENT_SELECT, data: sourceName });

    return this;
  }

  // db

  dbs() {
    return this._api.getStream('db');
  }

  selectCurrentDbs(refresh) {
    getFirst(this._api.selectDbs(refresh)).subscribe((data) => {
      this.currentDb = { data: _.ROOT };
      this.currentDbs.next(data);
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
    getFirst(this._api.selectSchemas(this.currentDb.data, refresh)).subscribe((data) => {
      this.currentSchema = { data: _.ROOT };
      this.currentSchemas.next(data);
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
    getFirst(this._api.selectSources(this.currentDb.data, this.currentSchema.data, refresh)).subscribe((data) => {
      this.currentSource = { data: _.ROOT };
      this.currentSources.next(data);
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

ConnectionFlow._ = _;
ConnectionFlow.Component = Component;

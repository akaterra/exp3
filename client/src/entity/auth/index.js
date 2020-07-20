import { default as Component } from './component';
import { default as _ } from './const';
import { Flow, getFirst } from '../../flow';

export default class AuthFlow extends Flow {
  get currentDrivers() {
    return this.getStream('driver:list');
  }

  get currentDriversNames() {
    return this.getStream('driver:list');
  }

  constructor(api) {
    super();

    this._api = api;
  }

  async run() {
    await this.selectCurrentDrivers().toPromise();

    this.emitAction(_.MODE, 'auth:credentials');

    while (true) {
      let { action, data } = await this.wait(_.CONNECT);

      console.log({ action, data }, 'auth');

      switch (action) {
        case _.CONNECT:
          const connection = await this.connect(data);

          this.emitAction(_.CONNECTION_OPEN, connection);

          break;
      }
    }
  }

  sendConnectAction(data) {
    return this.nextAction(_.CONNECT, data);
  }

  connect(credentials) {
    return this._api.connect(credentials);
  }

  selectCurrentDrivers(refresh) {
    getFirst(this._api.selectDrivers(refresh)).subscribe((data) => {
      this.currentDrivers.next(data);
    });

    return this.currentDrivers;
  }
}

AuthFlow._ = _;
AuthFlow.Component = Component;

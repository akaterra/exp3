import { map } from 'rxjs/operators';
import { default as Component } from './component';
import { default as _ } from './const';
import { Flow, getFirst } from '../../flow';

export default class AuthFlow extends Flow {
  get currentDrivers() {
    return this.getStream('driver:current');
  }

  get currentDriversNames() {
    return this.getStream('driver:current');
  }

  constructor(api) {
    super();

    this._api = api;
  }

  async run() {
    await this.sleep(1);
    await this.selectCurrentDrivers().toImmediatePromise();

    this.emitAction(_.MODE, null);

    while (true) {
      let { action, data } = await this.wait(_.CONNECT);

      console.log({ action, data }, 'auth');

      switch (action) {
        case _.CONNECT:
          this.emitAction(_.CONNECTION_OPEN, {});

          break;
      }
    }
  }

  sendConnectAction(data) {
    return this.sendAction(_.CONNECT, data);
  }

  selectCurrentDrivers(refresh) {
    getFirst(this._api.selectDrivers(refresh)).subscribe((data) => {
      this.currentDrivers.setData(data);
    });

    return this.currentDrivers;
  }
}

AuthFlow._ = _;
AuthFlow.Component = Component;

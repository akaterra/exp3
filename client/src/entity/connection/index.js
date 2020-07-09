import { map } from 'rxjs/operators';
import { default as Component } from './component';
import { default as _ } from './const';
import { Flow, getFirst } from '../../flow';

export default class ConnectionFlow extends Flow {
  constructor(api) {
    super();

    this._api = api;
  }

  async run() {
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
}

ConnectionFlow._ = _;
ConnectionFlow.Component = Component;

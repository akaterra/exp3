export { default as Component } from './ui';
import { default as _ } from './const';
import { default as AuthFlow } from '../auth';
import { Flow } from '../../flow';

export default class ComponentFlow extends Flow {
  get tabs() {
    return this.getStream('tab:list');
  }

  constructor(api) {
    super();

    this._api = api;
  }

  async run() {
    await this.sleep(1);

    this.emitAction(_.MODE, null);

    const authFlow = new AuthFlow(this._api);
    authFlow.run();
    authFlow.incomingPushTo(this);

    while (true) {
      let { action, data } = await this.wait();

      switch (action) {
        case AuthFlow._.CONNECTION_OPEN:
          break;
      }
    }
  }

  sendConnectAction(data) {
    return this.sendAction(_.CONNECT, data);
  }

  selectCurrentDrivers(refresh) {
    this._api.selectDrivers(refresh).pipe(first()).subscribe((data) => {
      this.currentDrivers.setData(data);
    });

    return this.currentDrivers;
  }
}

ComponentFlow._ = _;

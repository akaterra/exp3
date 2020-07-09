import { Arr } from 'invary';
import { default as Component } from './component';
import { default as _ } from './const';
import { default as AuthFlow } from '../auth';
import { Flow } from '../../flow';
import { Auth } from '../../organism/connection';

export default class MainFlow extends Flow {
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
    this.toIncomingPull(authFlow);
    authFlow.run();

    this.tabs.setData({ action: 'tab:list', data: Arr([{ type: 'auth', id: 0, flow: authFlow }]) });

    while (true) {
      let { action, data } = await this.wait();

      console.log({ action, data }, 'main');

      switch (action) {
        case AuthFlow._.CONNECTION_OPEN:
          break;
      }
    }
  }
}

MainFlow._ = _;
MainFlow.Component = Component;

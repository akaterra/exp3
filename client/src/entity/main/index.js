import { Arr } from 'invary';
import { default as Component } from './component';
import { default as _ } from './const';
import { default as AuthFlow } from '../auth';
import { default as ConnectionFlow } from '../connection';
import { Flow } from '../../flow';

export default class MainFlow extends Flow {
  get tabs() {
    return this.getStream('tab:list');
  }

  constructor(api) {
    super();

    this._api = api;
  }

  async run() {
    this.emitAction(_.MODE, null);

    const authFlow = new AuthFlow(this._api);
    this.toIncomingPull(authFlow);
    authFlow.run();

    this.tabs.next({
      action: 'tab:list',
      data: Arr([{
        type: 'auth',
        id: 'auth',
        name: 'Auth',
        flow: authFlow,
      }]),
    });

    while (true) {
      let { action, data } = await this.wait();

      console.log({ action, data }, 'main');

      switch (action) {
        case AuthFlow._.CONNECTION_OPEN:
          const connectionFlow = new ConnectionFlow(data);
          this.toIncomingPull(authFlow);
          connectionFlow.run();

          const [tabs, _] = this.tabs.data.push({
            type: 'connection',
            id: data.session.name,
            name: data.session.name,
            flow: connectionFlow,
          });

          this.tabs.next({
            action: 'tab:list',
            data: tabs,
          });

          break;
      }
    }
  }
}

MainFlow._ = _;
MainFlow.Component = Component;

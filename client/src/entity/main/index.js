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

    const connections = await this._api.selectConnections().toPromise();

    this.tabs.next({
      action: 'tab:list',
      data: this.tabs.data.batch((tabs) => {
        Object.entries(connections.data).forEach(([key, session]) => {
          const connectionFlow = new ConnectionFlow(this._api.createConnection(session));
          this.toIncomingPull(connectionFlow);
          connectionFlow.run();

          tabs = tabs.insertIndex(tabs.length - 1, {
            type: 'connection',
            id: key,
            name: session.name,
            flow: connectionFlow,
          });
        });

        return tabs;
      }),
    });

    while (true) {
      let { action, data } = await this.wait();

      console.log({ action, data }, 'main');

      switch (action) {
        case AuthFlow._.CONNECTION_OPEN:
          const connectionFlow = new ConnectionFlow(data);
          this.toIncomingPull(connectionFlow);
          connectionFlow.run();

          const tabs = this.tabs.data.insertIndex(this.tabs.data.length - 1, {
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

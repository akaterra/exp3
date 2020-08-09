import { Arr } from 'invary';
import { default as Component } from './component';
import { default as _ } from './const';
import { default as ConnectFlow } from '../connect';
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

  async onRunInit(...args) {
    this.emitAction(_.MODE, null);

    const connectFlow = new ConnectFlow(this._api).outgoingPushTo(this);

    connectFlow.run();

    this.tabs.next({
      action: 'tab:list',
      data: Arr([{
        type: 'connect',
        id: 'connect',
        name: 'Connect',
        flow: connectFlow,
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
  }

  async onRunIterAction(action, data) {
    switch (action) {
      case 'error':
        this.emitAction('error', data);

        break;
      case ConnectFlow._.CONNECTION_OPEN:
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

MainFlow._ = _;
MainFlow.Component = Component;

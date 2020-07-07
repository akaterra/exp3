export { default as Component } from './ui';
import { default as _ } from './const';
import { Flow } from '../../flow';

export default class ComponentFlow extends Flow {
  get currentDrivers() {
    return this.getStream('driver:current');
  }

  get currentDriversNames() {
    return this.currentDrivers.pipe(map(({ data }) => ({ data: Object.values(data).map(_ => _.name).sort() })));
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
      let { action, data } = await this.waitFor(_.CONNECT);

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
    this._api.selectDrivers(refresh).pipe(first()).subscribe((data) => {
      this.currentDrivers.setData(data);
    });

    return this.currentDrivers;
  }
}

ComponentFlow._ = _;

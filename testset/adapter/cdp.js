const BaseAdapter = require('../adapter').Adapter;
const BaseSelector = require('../selector').Selector;
const utils = require('../utils');

const PLATFORM_OPTIONS = {
  darwin: {
    cmd: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    cmdParams: {
      remoteDebuggingPort: 9222,
      userDataDir: 'remote-profile',
    },
  },
};

class Adapter extends BaseAdapter {
  get alias() {
    return this._alias ?? 'chrome';
  }

  get lib() {
    if (!this._lib) {
      this._lib = require('chrome-remote-interface');
    }

    return this._lib;
  }

  get universe() {
    return 'web';
  }

  async onRun(session) {
    let sessionPlatformOptions = session.config[this.alias] ?? {};
    let platformOptions;

    switch (utils.platform) {
      case 'win32':
        throw new Error(`Unsupported platform`);
      default:
        platformOptions = PLATFORM_OPTIONS[utils.platform];
    }

    if (!platformOptions) {
      throw new Error(`Unknown platform`);
    }

    const adapterSession = new Session();

    // adapterSession.$platformOptions = { ...platformOptions };
    // adapterSession.$browser = utils.spawn(platformOptions.cmd, platformOptions.cmdParams);
    // adapterSession.$browserProcess = adapterSession.$browser.childProcess;

    // adapterSession.$browserProcess.stdout.on('data', function (data) {
    //   console.log('[spawn] stdout: ', data.toString());
    // });
    // adapterSession.$browserProcess.stderr.on('data', function (data) {
    //     console.log('[spawn] stderr: ', data.toString());
    // });

    // adapterSession.$browser;
    // await new Promise((r) => setTimeout(r, 2000));
    adapterSession.$cdp = await this.lib();

    return adapterSession;
  }
}

class Element {
  constructor(session) {
    this._session = session;
  }

  get select() {
    return new ElementSelector(this._session);
  }
}

class ElementSelectorAction extends BaseSelector {
  constructor(session, chain) {
    super();

    this._chain = chain;
    this._session = session;
  }

  get textContent() {
    this._chain.push(async (nodeIds) => {
      nodeIds = nodeIds ?? [(await this._session.$cdp.DOM.getDocument()).root.nodeId];
      console.log(nodeIds[0]);
      console.log(nodeIds[0],await(this._session.$cdp.DOM.describeNode({nodeId:nodeIds[0][0]})));

      let a=await Promise.all(nodeIds.flat().map((el) => this._session.$cdp.DOM.getAttributes({ nodeId: el, attributes: ['value'] }).then((p) => p)));
    });

    return this;
  }
}

class ElementSelector extends BaseSelector {
  get do() {
    if (this._chain.length === 0) {
      throw new Error('Nothing to do, selectors chain is empty');
    }

    return new ElementSelectorAction(this._session, this._chain);
  }

  byCss(css, opts) {
    this._chain.push(async (nodeIds) => {
      nodeIds = nodeIds ?? [(await this._session.$cdp.DOM.getDocument()).root.nodeId];

      return Promise.all(nodeIds.flat().map((el) => this._session.$cdp.DOM.querySelectorAll({ nodeId: el, selector: css }).then((p) => p.nodeIds)));
    });

    return this;
  }

  byId(id, opts) {
    // this._chain.push(async (els) => {
    //   els = els ?? [await this._session.$cdp.DOM.getDocument()];

    //   return Promise.all(els.flat().map((el) => el.getElementById(id)));
    // });

    return this;
  }

  byName(name, opts) {
    // this._chain.push(async (els) => {
    //   els = els ?? [await this._session.$cdp.DOM.getDocument()];

    //   return Promise.all(els.flat().map((el) => el.getElementByName(name)));
    // });

    return this;
  }

  byXPath(xPath, opts) {

  }

  withAttr(attr, opts) {

  }

  withAttrValue(attr, value, opts) {

  }

  withSubText(text, opts) {

  }

  withRegexText(regex, opts) {

  }

  withText(text, opts) {

  }
}

class Page {
  constructor(session) {
    this._session = session;
  }

  get url() {
    return new ElementSelector(this._session);
  }

  navigate(url, opts) {
    return this._session.$cdp.Page.navigate({ url });
  }

  navigateToHistoryEntry(to, opts) {

  }

  reload(opts) {
    
  }
}

class Session {
  get element() {
    if (!this._element) {
      this._element = new Element(this);
    }

    return this._element;
  }

  get page() {
    if (!this._page) {
      this._page = new Page(this);
    }

    return this._page;
  }
}

Adapter.Adapter = Adapter;

module.exports = Adapter;

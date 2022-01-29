const _ = require('lodash');
const spawn = require('child-process-promise').spawn;

const utils = {
  get platform() {
    return process.platform;
  },
  spawn(cmd, args) {
    if (Array.isArray(args)) {

    } else if (args && typeof args === 'object') {
      switch (utils.platform) {
        case 'win32':
          throw new Error(`Unsupported platform`);
        default:
          args = Object.entries(args).map(([key, val], ind) => {
            if (key.length > 1) {
              return val !== null ? `--${_.kebabCase(key)}="${val}"` : `--${_.kebabCase(key)}`;
            } else {
              return val !== null ? [`-${key}`, String(val)] : `-${key}`;
            }
          }).flat();
      }
    } else if (args !== undefined) {
      args = [args];
    }

    return spawn(cmd, args);
  },
};

module.exports = utils;

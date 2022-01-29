module.exports = {
  Appium: trquire('./appium').Adapter,
  CDP: require('./cdp').Adapter,
  Selenium: trquire('./selenium').Adapter,
};

const Session = require('./session').Session;
const CDP = require('./adapter/cdp');

(async () => {
  const s = new Session();
  const a = new CDP();

  await a.run(s);
  await s.web.page.navigate('https://github.com');
  // await s.web.element.select.byCss('#user_email').do.textContent;
  console.log(await s.web.element.select.byCss('body').do.textContent);
  // await new Promise(r => setTimeout(r, 60000));
})();

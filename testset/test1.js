const CDP = require('chrome-remote-interface');

async function example() {
    let client;
    try {
        // connect to endpoint
        client = await CDP();
        // extract domains
        const {Network, Page, Runtime} = client;
        // setup handlers
        Network.requestWillBeSent((params) => {
            // console.log(params.request.url);
        });
        // enable events then start!
        await Network.enable();
        await Page.enable();
        await Page.navigate({url: 'https://google.com'});
        // console.log(await Runtime.evaluate({expression: 'function ololo () { return "ololo"; };'}))
        // console.log(await Runtime.evaluate({expression: 'ololo();'}))
        await Page.navigate({url: 'https://github.com'});
        console.log(await Runtime.evaluate({expression: 'window;'}))
        // console.log(await Runtime.evaluate({expression: 'ololo();'}))
        await Page.loadEventFired();
    } catch (err) {
        console.error(err);
    } finally {
        if (client) {
            await client.close();
        }
    }
}

example();
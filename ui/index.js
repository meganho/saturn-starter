import createSaturnStore from 'saturn-framework/app/store';
import createApp from 'saturn-framework/app';

// needed for targetUrl below
import config from 'saturn-framework/config';
import httpProxy from 'http-proxy';

import './apollo.js';

import count from './reducers/count';
const createStore = ({ client }) =>
  createSaturnStore({ client, reducers: { count } });

import routes from './routes';

const app = createApp({ routes, createStore });

/*
 * Ok this is terrible but needed until we have an official way to add
 * custom API endpoints to dev server in saturn.
 */
if (__SERVER__) {
  const targetUrl = 'http://' + config.apiHost + ':' + config.apiPort;
  const proxy = httpProxy.createProxyServer({
    target: targetUrl,
    ws: true
  });

  app.use('/ap-auth', (req, res) => {
    proxy.web(req, res, {target: targetUrl + '/ap-auth'});
  });

  const graphqlIndex = app._router.stack.findIndex(
    x => x.regexp.toString() == /^\/graphiql\/?(?=\/|$)/i.toString()
  );

  // Move the route to after /graphql,
  // i.e. after parsers, before default route.
  app._router.stack.splice(graphqlIndex, 0, app._router.stack.pop());
}

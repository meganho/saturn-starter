import apiServer from 'saturn-framework/api';

import { apolloExpress, graphiqlExpress  } from 'apollo-server';

import { schema, mocks } from './schema';
import resolvers from './resolvers';

import bodyParser from 'body-parser';

import { makeExecutableSchema, addMockFunctionsToSchema } from 'graphql-tools';

import ApolloPassport from 'apollo-passport';
import RethinkDBDashDriver from 'apollo-passport-rethinkdbdash';
import { Strategy as LocalStrategy } from 'apollo-passport-local';
import { Strategy as FacebookStrategy } from 'passport-facebook';

import rethinkdbdash from 'rethinkdbdash';

import { mergeResolvers, mergeSchemas } from 'apollo-passport/lib/utils/graphql-merge';

if (!process.env.ROOT_URL) {
  process.env.ROOT_URL = "http://localhost:3000/";
  console.warn('No ROOT_URL environment variable set, defaulting to '
    + process.env.ROOT_URL);
}

const r = rethinkdbdash({ db: 'test' });

const apolloPassport = new ApolloPassport({
  db: new RethinkDBDashDriver(r),
  jwtSecret: 'mysecret'    // will be optional/automatic in the future
});

// Pass the class, not the instance (i.e. no NEW), and no options for defaults
// Make sure you setup strategies BEFORE calling getSchema, getResolvers below.
apolloPassport.use('local', LocalStrategy);

// Example oauth2 strategy.  Meteor Accounts sytle configuration via UI coming soon...
apolloPassport.use('oauth2:facebook', FacebookStrategy, {
  // You can use this to test auth on localhost:3000
  clientID: '403859966407266',
  clientSecret: 'fd3ec904596e0b775927a1052a3f7165',
  // What permissions to request for this user
  // https://developers.facebook.com/docs/facebook-login/permissions/overview
  scope: [ 'public_profile', 'email' ],
  // https://developers.facebook.com/docs/graph-api/reference/v2.5/user
  profileFields: [
    'id', 'email',
    'first_name', 'middle_name', 'last_name',
    'gender', 'locale'
  ]
});

const executableSchema = makeExecutableSchema({
  typeDefs: mergeSchemas(schema.concat(apolloPassport.schema())),
  resolvers: mergeResolvers(resolvers, apolloPassport.resolvers()),
});

/*
addMockFunctionsToSchema({
  schema: executableSchema,
  resolvers,
  mocks,
});
*/

// Augment apolloServer's entry point with apolloPassport.wrapOptions(...)
apiServer.use('/graphql',
  bodyParser.json(),
  apolloExpress(apolloPassport.wrapOptions({
    schema: executableSchema
  })
));

apiServer.use('/graphiql', graphiqlExpress({
  endpointURL: '/graphql',
}));

// And add an entry-point for apollo passport.
apiServer.use('/ap-auth', apolloPassport.expressMiddleware());

apiServer.start();

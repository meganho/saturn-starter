import ApolloClient, { createNetworkInterface } from 'apollo-client';
import ApolloPassport from 'apollo-passport/lib/client';
import ApolloPassportLocal from 'apollo-passport-local/lib/client';
import apMiddleware from 'apollo-passport/lib/client/middleware';

let apolloClient, apolloPassport;

if (__CLIENT__) {
  const networkInterface = createNetworkInterface('/graphql');
  networkInterface.use([ apMiddleware ]);

  apolloClient = new ApolloClient({ networkInterface });
  apolloPassport = new ApolloPassport({ apolloClient });
  apolloPassport.use('local', ApolloPassportLocal);
}

export { apolloClient, apolloPassport };

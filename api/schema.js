export const schema = [`
type RootQuery {
  testString: String
}

type RootMutation {
  testString: String
}

schema {
  query: RootQuery,
  mutation: RootMutation
}
`];

export const mocks = {
  String: () => 'It works!',
};

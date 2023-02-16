import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';

import sqlite3 from 'sqlite3';
import util from 'node:util';

const db = new sqlite3.Database("./blog.db");

const typeDefs = `#graphql
  type Query {

      """エントリー一覧"""
      entries: [Entry!]
  }

  type Entry {
      """ID"""
      id: ID!

      """Entryのタイトル"""
      title: String!

      """Entryの本文"""
      body: String!

      """Entryへのコメント"""
      comments: [EntryComment!]
  }

  type EntryComment {
     id: ID!

     """コメント本文"""
     body: String!
  }
`;

type Entry = {
  id: string;
  title: string;
  body: string;
};

const resolvers = {
  Query: {
    entries: async () => {

      const queryStatement = db.prepare(`SELECT id, title FROM entry LIMIT ${process.env.LIMIT}`);
      const entries = (
        await util.promisify(
                queryStatement
                .all
                .bind(queryStatement))
                .call(queryStatement)
      ) as Entry[];

      return entries
    },
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

const { url } = await startStandaloneServer(server, {
  listen: { port: 4000 },
});

console.log(`🚀  Server ready at: ${url}`);

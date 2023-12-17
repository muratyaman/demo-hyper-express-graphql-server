import { readFileSync } from 'fs';
import { Source, parse, validate, execute, specifiedRules, GraphQLSchema } from 'graphql';
import { makeExecutableSchema } from '@graphql-tools/schema';

import { IConfig, IDtoLocationHistory, IDtoUser, IGqlLocationHistoryArgs, IGraphqlCommand, IHttpRequest, IHttpResponse, IGqlContext } from './types';
import { IDb } from './types';
 
export async function makeGraphqlCommandRunner(schema: GraphQLSchema) {

  async function commandRunner(cmd: IGraphqlCommand, contextValue: IGqlContext) {
    const { query, variables, operationName } = cmd;
    const documentAST = parse(new Source(query, 'GraphQL request'));

    const validationErrors = validate(schema, documentAST, [
      ...specifiedRules,
      //...validationRules,
    ]);
    if (validationErrors.length > 0) {
      throw new Error(validationErrors.map((err) => err.message).join('\n'));
    }

    return execute({
      schema,
      document: documentAST,
      //rootValue,
      contextValue,
      variableValues: variables,
      operationName,
      //fieldResolver,
    });
  }

  return commandRunner;
}

export async function makeGraphqlSchema(config: IConfig, db: IDb) {  
  const typeDefs = readFileSync(config.GRAPHQL_SCHEMA || './schema.graphql', 'utf8');
  const resolvers = await makeGraphqlResolvers(config, db);
  return makeExecutableSchema({ typeDefs, resolvers });
}

export async function makeGraphqlContext(config: IConfig, db: IDb, req: IHttpRequest, res: IHttpResponse): Promise<IGqlContext> {
  // TODO: check for auth token, etc.
  return {
    req,
    res,
    services: {
      config,
      db,
    },
  };
}

export async function makeGraphqlResolvers(_config: IConfig, db: IDb) {
  return {
    Query: {
      health: async () => {
        return await db.checkHealth();
      },
      me: async () => {
        // TODO: implement this
        return {
          id: 'id123456',
          nickname: 'haci',
        } as IDtoUser;
      },
    },
    User: {
      id: (parent: IDtoUser) => String(parent.id),
      username: (parent: IDtoUser) => String(parent.nickname),
      locationHistory: async (parent: IDtoUser, args: IGqlLocationHistoryArgs) => {
        const { after, limit = 10 } = args.inputs;
        return await db.getGocationHistory(parent.id, after, limit || 10);
      },
    },
    Location: {
      ts: (parent: IDtoLocationHistory) => new Date(parent.log_date * 1000).toISOString(),
      latitude: (parent: IDtoLocationHistory) => parent.lat,
      longitude: (parent: IDtoLocationHistory) => parent.lng,
      radiusInMetres: (parent: IDtoLocationHistory) => parent.rad,
    },
  };
}

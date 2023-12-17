import dotenv from 'dotenv';
import { Server } from 'hyper-express';

import { makeConfig } from './config';
import { makeDb } from './db';
import { makeGraphqlCommandRunner, makeGraphqlContext, makeGraphqlSchema } from './graphql';
import { IGraphqlCommand } from './types';

dotenv.config();
main();

async function main() {
  const app = new Server();

  const config = makeConfig(process.env);

  const db = await makeDb(config);

  const schema = await makeGraphqlSchema(config, db);

  const gqlCmdRunner = await makeGraphqlCommandRunner(schema);

  app.get('/health', (_req, res) => {
    res.send('Hello hyper-express');
  });

  app.get('/', (_req, res) => {
    res.send('Hello hyper-express');
  });

  app.post('/test', async (req, res) => {
    const { headers } = req;
    let body = await req.json();
    res.json({
      ts: new Date(),
      status: 'ok',
      echo: { headers, body },
    });
  });

  app.post('/graphql', async (req, res) => {
    let result: any = null;
    try {
      const body = await req.json();
      const query: string = body.query && typeof body.query === 'string' ? body.query : '';
      const operationName: string | undefined = body.operationName && typeof body.operationName === 'string' ? body.operationName : undefined;
      const variables: any = body.variables || {};
      const context = await makeGraphqlContext(config, db, req, res);
      const cmd: IGraphqlCommand = { query, variables, operationName };
      result = await gqlCmdRunner(cmd, context);
    } catch (err) {
      result = { error: err instanceof Error ? err.message : 'Unknown error' };
    }

    res.json(result);
  });

  app
    .listen(8080)
    .then((_socket) => console.log('Web server started on port 8080'))
    .catch((error) => console.log('Failed to start app on port 8080', error));
}

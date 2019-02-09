import {RentmonitorServerApplication} from '../..';
import {
  createRestAppClient,
  givenHttpServerConfig,
  Client,
} from '@loopback/testlab';
import {testdb} from '../fixtures/datasources/testdb.datasource';

export async function setupApplication(): Promise<AppWithClient> {
  const config = givenHttpServerConfig();
  config.host = '127.0.0.1';
  const app = new RentmonitorServerApplication({
    //rest: givenHttpServerConfig(),
    rest: config,
  });

  app.dataSource(testdb);
  await app.boot();
  await app.start();

  const client = createRestAppClient(app);

  return {app, client};
}

export interface AppWithClient {
  app: RentmonitorServerApplication;
  client: Client;
}

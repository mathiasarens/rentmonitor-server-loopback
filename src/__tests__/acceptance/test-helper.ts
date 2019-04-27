import {
  Client,
  createRestAppClient,
  givenHttpServerConfig,
} from '@loopback/testlab';
import {RentmonitorServerApplication} from '../..';
import {
  BookingRepository,
  ClientRepository,
  TenantRepository,
} from '../../repositories';

export async function setupApplication(): Promise<AppWithClient> {
  const config = givenHttpServerConfig();
  config.host = '127.0.0.1';
  const app = new RentmonitorServerApplication({
    //rest: givenHttpServerConfig(),
    rest: config,
  });

  await app.boot();
  await app.start();

  const client = createRestAppClient(app);

  return {app, client};
}

export interface AppWithClient {
  app: RentmonitorServerApplication;
  client: Client;
}

export async function givenEmptyDatabase(app: RentmonitorServerApplication) {
  const debitorRepository = await app.getRepository(TenantRepository);
  const bookingRepository = await app.getRepository(BookingRepository);
  const clientRepository = await app.getRepository(ClientRepository);

  await debitorRepository.deleteAll();
  await clientRepository.deleteAll();
  await bookingRepository.deleteAll();
}

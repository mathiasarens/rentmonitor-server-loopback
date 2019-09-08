import {
  Client,
  createRestAppClient,
  givenHttpServerConfig,
} from '@loopback/testlab';
import {RentmonitorServerApplication} from '../..';
import {
  AccountSettingsRepository,
  AccountTransactionRepository,
  BookingRepository,
  ClientRepository,
  ContractRepository,
  TenantRepository,
  UserRepository,
} from '../../repositories';

export async function setupApplication(): Promise<AppWithClient> {
  const config = givenHttpServerConfig();
  config.host = '127.0.0.1';
  const app = new RentmonitorServerApplication({
    //rest: givenHttpServerConfig(),
    rest: config,
  });
  app.bind('datasources.encryption.password').to('test');
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
  const tenantRepository = await app.getRepository(TenantRepository);
  const bookingRepository = await app.getRepository(BookingRepository);
  const clientRepository = await app.getRepository(ClientRepository);
  const accountTransactionRepository = await app.getRepository(
    AccountTransactionRepository,
  );
  const contractRepository = await app.getRepository(ContractRepository);
  const accountSettingsRepository = await app.getRepository(
    AccountSettingsRepository,
  );
  const accountTransactionLogRepository = await app.getRepository(
    AccountTransactionRepository,
  );
  const userRepository = await app.getRepository(UserRepository);

  await accountTransactionRepository.deleteAll();
  await bookingRepository.deleteAll();
  await contractRepository.deleteAll();
  await tenantRepository.deleteAll();

  await accountSettingsRepository.deleteAll();
  await accountTransactionLogRepository.deleteAll();

  await userRepository.deleteAll();
  await clientRepository.deleteAll();
}

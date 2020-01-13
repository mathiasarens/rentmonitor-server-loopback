import {
  Client,
  createRestAppClient,
  givenHttpServerConfig,
} from '@loopback/testlab';
import {TanRequiredError} from 'fints-psd2-lib';
import {RentmonitorServerApplication} from '../..';
import {TokenServiceBindings} from '../../keys';
import {
  AccountSettingsRepository,
  AccountTransactionRepository,
  BookingRepository,
  ClientRepository,
  ContractRepository,
  TenantRepository,
  UserRepository,
} from '../../repositories';
import {
  FinTsAccountDTO,
  FinTsAccountTransactionDTO,
  FintsService,
} from '../../services/accountsynchronisation/fints.service';
import {FintsServiceBindings} from '../../services/accountsynchronisation/fints.service.impl';
import {JWTService} from '../../services/authentication/jwt.service';

const JWT_TOKEN_SECRET = 'test';

export async function setupApplication(): Promise<AppWithClient> {
  const config = givenHttpServerConfig();
  config.host = '127.0.0.1';
  const app = new RentmonitorServerApplication({
    //rest: givenHttpServerConfig(),
    rest: config,
  });
  app.bind('datasources.encryption.password').to('password');
  app.bind('datasources.encryption.salt').to('salt');
  app.bind('datasources.config.rentmonitor').to({
    name: 'rentmonitor_test',
    connector: 'postgresql',
    url: '',
    host: 'localhost',
    port: 5432,
    user: 'rentmonitor_test',
    password: 'rentmonitor',
    database: 'rentmonitor_test',
  });
  app.bind(TokenServiceBindings.TOKEN_SECRET).to(JWT_TOKEN_SECRET);
  app.bind(FintsServiceBindings.SERVICE).toClass(FintsServiceDummy);
  await app.boot();
  await app.start();

  const client = createRestAppClient(app);

  const jwtService = new JWTService(
    JWT_TOKEN_SECRET,
    TokenServiceBindings.TOKEN_EXPIRES_IN.key,
  );

  return {app, client, jwtService};
}

class FintsServiceDummy implements FintsService {
  fetchStatements(
    fintsBlz: string,
    fintsUrl: string,
    fintsUser: string,
    fintsPassword: string,
    selectedAccount: string,
  ): Promise<FinTsAccountTransactionDTO[]> {
    throw new Error('Method not implemented.');
  }
  fetchAccounts(
    fintsBlz: string,
    fintsUrl: string,
    fintsUser: string,
    fintsPassword: string,
  ): Promise<FinTsAccountDTO[]> {
    if (fintsUser === 'TanRequired') {
      throw new TanRequiredError(
        'Tan required',
        'reference1',
        Buffer.from('media1'),
      );
    }
    return Promise.resolve(
      Array(new FinTsAccountDTO('rawString1', 'name1', 'iban1', 'bic1')),
    );
  }
}

export interface AppWithClient {
  app: RentmonitorServerApplication;
  client: Client;
  jwtService: JWTService;
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

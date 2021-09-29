import {DataObject} from '@loopback/repository';
import {
  Client,
  createRestAppClient,
  givenHttpServerConfig,
} from '@loopback/testlab';
import {Connection, Dialog, DialogConfig, TanRequiredError} from 'node-fints';
import {RentmonitorServerApplication} from '../..';
import {PasswordHasherBindings, TokenServiceBindings} from '../../keys';
import {AccountSettings, Booking, Contract, Tenant, User} from '../../models';
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
import {PasswordHasher} from '../../services/authentication/hash.password.bcryptjs';
import {JWTService} from '../../services/authentication/jwt.service';

const JWT_TOKEN_SECRET = 'test';

export async function setupApplication(): Promise<AppWithClient> {
  const config = givenHttpServerConfig();
  config.host = '127.0.0.1';
  const app = new RentmonitorServerApplication({
    rest: config,
  });
  app
    .bind('datasources.encryption.password')
    .to(process.env.RENTMONITOR_DB_ENCRYPTION_SECRET);
  app
    .bind('datasources.encryption.salt')
    .to(process.env.RENTMONITOR_DB_ENCRYPTION_SALT);
  app.bind('datasources.config.rentmonitor').to({
    name: 'rentmonitor_test',
    connector: 'postgresql',
    url: '',
    host: process.env.RENTMONITOR_TEST_DB_HOST,
    port: process.env.RENTMONITOR_TEST_DB_PORT,
    user: process.env.RENTMONITOR_TEST_DB_USER,
    password: process.env.RENTMONITOR_TEST_DB_PASSWORD,
    database: process.env.RENTMONITOR_TEST_DB_USER,
  });
  app.bind(TokenServiceBindings.TOKEN_SECRET).to(JWT_TOKEN_SECRET);
  app.bind(FintsServiceBindings.SERVICE).toClass(FintsServiceDummy);
  await app.boot();
  await app.start();
  // const restServer = await app.getServer(RestServer);
  // console.log(
  //   `Server started on ${await restServer.get(
  //     'rest.host',
  //   )}:${await restServer.get('rest.port')}`,
  // );

  // rest client
  const client = createRestAppClient(app);

  const jwtService = new JWTService(
    JWT_TOKEN_SECRET,
    TokenServiceBindings.TOKEN_EXPIRES_IN.key,
  );

  return {app, client, jwtService};
}

class FintsServiceDummy implements FintsService {
  fetchStatements(
    accountSettings: AccountSettings,
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
        'text1',
        Buffer.from('media1'),
        new Dialog({} as DialogConfig, {} as Connection),
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

  await bookingRepository.deleteAll();
  await contractRepository.deleteAll();
  await tenantRepository.deleteAll();

  await accountSettingsRepository.deleteAll();
  await accountTransactionRepository.deleteAll();
  await accountTransactionLogRepository.deleteAll();

  await userRepository.deleteAll();
  await clientRepository.deleteAll();
}

export async function login(http: Client, user: User): Promise<string> {
  const res = await http
    .post('/users/login')
    .send({email: user.email, password: user.password})
    .expect(200);

  const token = res.body.token;
  return token;
}

export function getTestUser(testId: string): User {
  const testUser = Object.assign({}, new User(), {
    email: 'test@loopback' + testId + '.io',
    password: 'p4ssw0rd',
    firstName: 'Example',
    lastName: 'User ' + testId,
  });
  return testUser;
}

export async function setupClientInDb(
  app: RentmonitorServerApplication,
  name: string,
): Promise<number> {
  const clientRepository = await app.getRepository(ClientRepository);
  const clientFromDb = await clientRepository.create({name: name});
  return clientFromDb.id;
}

export async function setupUserInDb(
  app: RentmonitorServerApplication,
  clientId: number,
  user: User,
) {
  const passwordHasher: PasswordHasher = await app.get(
    PasswordHasherBindings.PASSWORD_HASHER,
  );
  const encryptedPassword = await passwordHasher.hashPassword(user.password);
  const userRepository: UserRepository = await app.getRepository(
    UserRepository,
  );
  const newUser: DataObject<User> = Object.assign({}, user, {
    password: encryptedPassword,
    clientId: clientId,
  });
  const newUserFromDb = await userRepository.create(newUser);
  return newUserFromDb;
}

export async function setupTenantInDb(
  app: RentmonitorServerApplication,
  tenant: Tenant,
): Promise<Tenant> {
  const tenantRepository = await app.getRepository(TenantRepository);
  return tenantRepository.save(tenant);
}

export async function setupContractInDb(
  app: RentmonitorServerApplication,
  contract: Contract,
): Promise<Contract> {
  const contractRepository = await app.getRepository(ContractRepository);
  return contractRepository.save(contract);
}

export async function setupBookingInDb(
  app: RentmonitorServerApplication,
  booking: Booking,
): Promise<Booking> {
  const bookingRepository = await app.getRepository(BookingRepository);
  return bookingRepository.save(booking);
}

export async function clearDatabase(
  app: RentmonitorServerApplication,
): Promise<void> {
  await givenEmptyDatabase(app);
}

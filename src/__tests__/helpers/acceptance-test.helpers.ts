import {BindingScope} from '@loopback/context';
import {
  Client,
  createRestAppClient,
  givenHttpServerConfig,
} from '@loopback/testlab';
import {
  Connection,
  Dialog,
  DialogConfig,
  TanRequiredError,
} from '@mathiasarens/fints';
import jwt, {JwtPayload} from 'jsonwebtoken';
import {RentmonitorServerApplication} from '../..';
import {TokenServiceBindings} from '../../keys';
import {AccountSettings, Booking, Contract, Tenant, User} from '../../models';
import {
  AccountSettingsRepository,
  AccountTransactionRepository,
  BookingRepository,
  ClientRepository,
  ContractRepository,
  TenantRepository,
} from '../../repositories';
import {
  FinTsAccountDTO,
  FinTsAccountTransactionDTO,
  FintsService,
} from '../../services/accountsynchronisation/fints.service';
import {FintsServiceBindings} from '../../services/accountsynchronisation/fints.service.impl';
import {AwsJwkServiceMock} from '../fixtures/authentication/aws.jwk.service.mock';
import {readFile} from './file.helper';

const PRIVATE_KEY = readFile('./src/__tests__/fixtures/keys/jwtRS256.key');
const TEST_JWT_AUDIENCE = 'test_audience';
const TEST_JWT_ISSUER = 'test_issuer';

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
    host: process.env.RENTMONITOR_TEST_DB_HOST,
    port: process.env.RENTMONITOR_TEST_DB_PORT,
    user: process.env.RENTMONITOR_TEST_DB_USER,
    password: process.env.RENTMONITOR_TEST_DB_PASSWORD,
    database: process.env.RENTMONITOR_TEST_DB_USER,
  });
  app
    .bind(TokenServiceBindings.AWS_COGNITO_JWK_URL)
    .to('./src/__tests__/fixtures/keys/jwtRS256.key.jwk');
  app.bind(TokenServiceBindings.AWS_COGNITO_JWT_AUDIENCE).to(TEST_JWT_AUDIENCE);
  app.bind(TokenServiceBindings.AWS_COGNITO_JWT_ISSUER).to(TEST_JWT_ISSUER);

  app
    .bind(TokenServiceBindings.AWS_COGNITO_JWK_SERVICE)
    .toClass(AwsJwkServiceMock)
    .inScope(BindingScope.SINGLETON);

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

  return {app, client};
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

  await bookingRepository.deleteAll();
  await contractRepository.deleteAll();
  await tenantRepository.deleteAll();

  await accountSettingsRepository.deleteAll();
  await accountTransactionRepository.deleteAll();
  await accountTransactionLogRepository.deleteAll();

  await clientRepository.deleteAll();
}

export interface AuthenticationTokens {
  accessToken: string;
  idToken: string;
}

export async function login(
  http: Client,
  user: User,
): Promise<AuthenticationTokens> {
  const accessToken = generateToken(
    {
      username: user.id,
      // eslint-disable-next-line @typescript-eslint/naming-convention
      client_id: TEST_JWT_AUDIENCE,
      // eslint-disable-next-line @typescript-eslint/naming-convention
      token_use: 'access',
    },
    {
      issuer: TEST_JWT_ISSUER,
      expiresIn: Number(3600),
      algorithm: 'RS256',
    },
  );
  const idToken = generateToken(
    {
      'cognito:username': user.id,
      email: user.email,
      'custom:clientId2': user.clientId,
      // eslint-disable-next-line @typescript-eslint/naming-convention
      token_use: 'id',
    },
    {
      expiresIn: Number(3600),
      issuer: TEST_JWT_ISSUER,
      audience: TEST_JWT_AUDIENCE,
      algorithm: 'RS256',
    },
  );
  return {accessToken, idToken};
}

export function getTestUser(clientId: number, testId: number): User {
  const testUser = Object.assign({}, new User(), {
    email: 'test@loopback' + testId + '.io',
    password: 'p4ssw0rd',
    firstName: 'Example',
    lastName: 'User ' + testId,
    clientId: clientId,
  });
  return testUser;
}

function generateToken(payload: JwtPayload, options: jwt.SignOptions): string {
  // Generate a JSON Web Token
  let token: string;
  try {
    token = jwt.sign(payload, PRIVATE_KEY, options);
  } catch (error) {
    throw new Error(`Error encoding token : ${error}`);
  }
  return token;
}

export async function setupClientInDb(
  app: RentmonitorServerApplication,
  name: string,
): Promise<number> {
  const clientRepository = await app.getRepository(ClientRepository);
  const clientFromDb = await clientRepository.create({name: name});
  return clientFromDb.id;
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

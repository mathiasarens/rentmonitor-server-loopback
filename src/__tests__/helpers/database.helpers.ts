import {Getter} from '@loopback/context';
import {Client, Tenant} from '../../../src/models';
import {
  AccountSettingsRepository,
  AccountTransactionRepository,
  BookingRepository,
  ClientRepository,
  ContractRepository,
  TenantRepository,
} from '../../repositories';
import {testdb} from '../fixtures/datasources/rentmontior.datasource';

export async function givenEmptyDatabase() {
  const clientRepository = new ClientRepository(testdb);
  const clientRepositoryGetter = Getter.fromValue(clientRepository);
  const tenantRepository = new TenantRepository(testdb, clientRepositoryGetter);
  const tenantRepositoryGetter = Getter.fromValue(tenantRepository);
  const contractRepository = new ContractRepository(
    testdb,
    clientRepositoryGetter,
    tenantRepositoryGetter,
  );
  const bookingRepository = new BookingRepository(
    testdb,
    clientRepositoryGetter,
    tenantRepositoryGetter,
    Getter.fromValue(contractRepository),
  );
  const accountSettingsRepository = new AccountSettingsRepository(
    testdb,
    clientRepositoryGetter,
    'test_password',
    'test_salt',
  );
  const accountTransactionRepository = new AccountTransactionRepository(
    testdb,
    clientRepositoryGetter,
  );
  await accountTransactionRepository.deleteAll();
  await bookingRepository.deleteAll();
  await contractRepository.deleteAll();
  await tenantRepository.deleteAll();

  await accountSettingsRepository.deleteAll();

  await clientRepository.deleteAll();
}

export function givenClientData(data?: Partial<Client>) {
  return Object.assign(
    {
      name: 'Test-Konto',
    },
    data,
  );
}

export function givenDebitorData(data?: Partial<Tenant>) {
  return Object.assign(
    {
      name: 'Test-Debitor',
    },
    data,
  );
}

export async function givenClient(data?: Partial<Client>) {
  return new ClientRepository(testdb).create(givenClientData(data));
}

export async function givenTenant(data?: Partial<Tenant>) {
  return new TenantRepository(
    testdb,
    Getter.fromValue(new ClientRepository(testdb)),
  ).create(givenDebitorData(data));
}

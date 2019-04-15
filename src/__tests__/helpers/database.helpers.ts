import {Getter} from '@loopback/context';
import {Client, Debitor} from '../../../src/models';
import {
  AccountSettingsRepository,
  AccountTransactionLogRepository,
  AccountTransactionRepository,
  BookingRepository,
  ClientRepository,
  DebitorRepository,
} from '../../repositories';
import {testdb} from '../fixtures/datasources/rentmontior.datasource';

export async function givenEmptyDatabase() {
  const accountTransactionRepository = new AccountTransactionRepository(testdb);
  const accountSettingsRepository = new AccountSettingsRepository(testdb);
  const accountTransactionLogRepository = new AccountTransactionLogRepository(
    testdb,
  );
  const debitorRepository = new DebitorRepository(testdb);
  const bookingRepository = new BookingRepository(testdb);
  const clientRepository = new ClientRepository(
    testdb,
    Getter.fromValue(debitorRepository),
    Getter.fromValue(bookingRepository),
  );
  // const debitorRepository = new DebitorRepository(
  //   testdb,
  //   Getter.fromValue(clientRepository),
  // );
  // const bookingRepository = new BookingRepository(
  //   testdb,
  //   Getter.fromValue(clientRepository),
  //   Getter.fromValue(debitorRepository),
  // );
  await accountTransactionRepository.deleteAll();
  await accountTransactionLogRepository.deleteAll();
  await accountSettingsRepository.deleteAll();
  await debitorRepository.deleteAll();
  await clientRepository.deleteAll();
  await bookingRepository.deleteAll();
}

export function givenClientData(data?: Partial<Client>) {
  return Object.assign(
    {
      name: 'Test-Konto',
    },
    data,
  );
}

export function givenDebitorData(data?: Partial<Debitor>) {
  return Object.assign(
    {
      name: 'Test-Debitor',
    },
    data,
  );
}

export async function givenClient(data?: Partial<Client>) {
  const debitorRepository = new DebitorRepository(testdb);
  const bookingRepository = new BookingRepository(testdb);
  return await new ClientRepository(
    testdb,
    Getter.fromValue(debitorRepository),
    Getter.fromValue(bookingRepository),
  ).create(givenClientData(data));
}

export async function givenDebitor(data?: Partial<Debitor>) {
  return await new DebitorRepository(testdb).create(givenDebitorData(data));
}

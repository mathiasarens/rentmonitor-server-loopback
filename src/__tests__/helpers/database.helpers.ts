import {Getter} from '@loopback/context';
import {ClientRepository, DebitorRepository} from '../../../src/repositories';
import {Client} from '../../../src/models';
import {testdb} from '../fixtures/datasources/rentmontior.datasource';

export async function givenEmptyDatabase() {
  const clientRepository = new ClientRepository(testdb);
  const debitorRepository = new DebitorRepository(
    testdb,
    Getter.fromValue(clientRepository),
  );
  await clientRepository.deleteAll();
  await debitorRepository.deleteAll();
}

export function givenClientData(data?: Partial<Client>) {
  return Object.assign(
    {
      name: 'Test-Konto',
    },
    data,
  );
}

export async function givenClient(data?: Partial<Client>) {
  return await new ClientRepository(testdb).create(givenClientData(data));
}

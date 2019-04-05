import {Getter} from '@loopback/context';
import {DebitorRepository} from '../../../../src/repositories';
import {Client} from '../../../../src/models';
import {ClientRepository} from '../../../../src/repositories/client.repository';
import {testdb} from '../../fixtures/datasources/rentmontior.datasource';
import {givenEmptyDatabase, givenClient} from '../../helpers/database.helpers';
import {expect} from '@loopback/testlab';

describe('Debitor Integration', () => {
  let debitorRepository: DebitorRepository;
  let clientRepository: ClientRepository;

  before('setupApplication', async () => {
    await givenEmptyDatabase();

    clientRepository = new ClientRepository(testdb);
    debitorRepository = new DebitorRepository(
      testdb,
      Getter.fromValue(clientRepository),
    );
  });

  after(async () => {});

  it('should create debitor', async function() {
    const dbClient: Client = await givenClient({name: 'Rentmonitor Test'});
    await debitorRepository.create({
      clientId: dbClient.id,
      name: 'Debitor1',
      email: 'name@debitor1.de',
    });

    const debitorsFromDb = await debitorRepository.find();
    expect(debitorsFromDb.length).to.equal(1);
  });
});

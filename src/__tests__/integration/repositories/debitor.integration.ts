import {expect} from '@loopback/testlab';
import {Client} from '../../../models';
import {DebitorRepository} from '../../../repositories';
import {testdb} from '../../fixtures/datasources/rentmontior.datasource';
import {givenClient, givenEmptyDatabase} from '../../helpers/database.helpers';

describe('Debitor Integration', () => {
  let debitorRepository: DebitorRepository;

  before('setupApplication', async () => {
    await givenEmptyDatabase();

    debitorRepository = new DebitorRepository(testdb);
  });

  after(async () => {});

  it('should create debitor', async function() {
    const dbClient: Client = await givenClient({name: 'Rentmonitor Test'});
    await debitorRepository.create({
      clientId: dbClient.id,
      name: 'Debitor1',
      email: 'name@debitor1.de',
      phone: '+492952999',
      start: new Date(2019, 4, 8),
      rentDueEveryMonth: 1,
      rentDueDayOfMonth: 10,
      amount: 5950,
    });

    const debitorsFromDb = await debitorRepository.find();
    expect(debitorsFromDb.length).to.equal(1);
    expect(debitorsFromDb[0].clientId).to.equal(dbClient.id);
    expect(debitorsFromDb[0].name).to.equal('Debitor1');
    expect(debitorsFromDb[0].email).to.equal('name@debitor1.de');
    expect(debitorsFromDb[0].phone).to.equal('+492952999');
    expect(
      debitorsFromDb[0].start!.getTime() === new Date(2019, 4, 8).getTime(),
    ).to.be.true();
    expect(debitorsFromDb[0].rentDueEveryMonth).to.equal(1);
    expect(debitorsFromDb[0].rentDueDayOfMonth).to.equal(10);
    expect(debitorsFromDb[0].amount).to.equal(5950);
  });
});

import {Getter} from '@loopback/context';
import {expect} from '@loopback/testlab';
import {Client, Tenant} from '../../../models';
import {
  ClientRepository,
  ContractRepository,
  TenantRepository,
} from '../../../repositories';
import {testdb} from '../../fixtures/datasources/rentmontior.datasource';
import {
  givenClient,
  givenEmptyDatabase,
  givenTenant,
} from '../../helpers/database.helpers';

describe('Contract Repository Integration Tests', () => {
  let contractRepository: ContractRepository;

  before('setupApplication', async () => {
    await givenEmptyDatabase();

    const clientRepositoryGetter = Getter.fromValue(
      new ClientRepository(testdb),
    );
    contractRepository = new ContractRepository(
      testdb,
      clientRepositoryGetter,
      Getter.fromValue(new TenantRepository(testdb, clientRepositoryGetter)),
    );
  });

  after(async () => {});

  it('should create contract', async function () {
    const dbClient: Client = await givenClient({name: 'Rentmonitor Test'});
    const dbTenant: Tenant = await givenTenant({
      clientId: dbClient.id,
      name: 'Tenant1',
      email: 'name@debitor1.de',
      phone: '+492952999',
    });

    await contractRepository.create({
      clientId: dbClient.id,
      tenantId: dbTenant.id,
      start: new Date(2019, 0, 1),
      end: new Date(2020, 0, 1),
      rentDueEveryMonth: 3,
      rentDueDayOfMonth: 15,
      amount: 5000,
      accountSynchronisationName: 'accountSynchronisation',
    });

    const contractFromDb = await contractRepository.find();
    expect(contractFromDb.length).to.equal(1);
    expect(contractFromDb[0].clientId).to.equal(dbClient.id);
    expect(contractFromDb[0].tenantId).to.equal(dbTenant.id);
    expect(contractFromDb[0].start.getTime()).to.equal(
      new Date(2019, 0, 1).getTime(),
    );
    expect(contractFromDb[0].end!.getTime()).to.equal(
      new Date(2020, 0, 1).getTime(),
    );
    expect(contractFromDb[0].rentDueEveryMonth).to.equal(3);
    expect(contractFromDb[0].rentDueDayOfMonth).to.equal(15);
    expect(contractFromDb[0].amount).to.equal(5000);
    expect(contractFromDb[0].accountSynchronisationName).to.equal(
      'accountSynchronisation',
    );
  });
});

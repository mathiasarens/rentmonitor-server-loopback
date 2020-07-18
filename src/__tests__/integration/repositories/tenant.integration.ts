import {Getter} from '@loopback/context';
import {expect} from '@loopback/testlab';
import {Client} from '../../../models';
import {ClientRepository, TenantRepository} from '../../../repositories';
import {testdb} from '../../fixtures/datasources/rentmontior.datasource';
import {givenClient, givenEmptyDatabase} from '../../helpers/database.helpers';

describe('Tenant Repository Integration Tests', () => {
  let tenantRepository: TenantRepository;

  before('setupApplication', async () => {
    await givenEmptyDatabase();

    tenantRepository = new TenantRepository(
      testdb,
      Getter.fromValue(new ClientRepository(testdb)),
    );
  });

  after(async () => {});

  it('should create tenant', async function () {
    const dbClient: Client = await givenClient({name: 'Rentmonitor Test'});
    await tenantRepository.create({
      clientId: dbClient.id,
      name: 'Tenant1',
      email: 'name@tenant1.de',
      phone: '+492952999',
    });

    const tenantFromDb = await tenantRepository.find();
    expect(tenantFromDb.length).to.equal(1);
    expect(tenantFromDb[0].clientId).to.equal(dbClient.id);
    expect(tenantFromDb[0].name).to.equal('Tenant1');
    expect(tenantFromDb[0].email).to.equal('name@tenant1.de');
    expect(tenantFromDb[0].phone).to.equal('+492952999');
  });
});

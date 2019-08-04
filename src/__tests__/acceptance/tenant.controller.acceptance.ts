import {Client, expect} from '@loopback/testlab';
import {RentmonitorServerApplication} from '../..';
import {ClientRepository, TenantRepository} from '../../repositories';
import {givenEmptyDatabase, setupApplication} from './test-helper';

describe('TenantController', () => {
  let app: RentmonitorServerApplication;
  let http: Client;

  before('setupApplication', async () => {
    ({app, client: http} = await setupApplication());
  });

  beforeEach(clearDatabase);

  after(async () => {
    await app.stop();
  });

  it('should add new tenant on post', async () => {
    const clientId = await setupClientInDb();
    const debitorName = 'TestDebitor1';
    const res = await createDebitorViaHttp(clientId, debitorName)
      .expect(200)
      .expect('Content-Type', 'application/json');
    expect(res.body.id).to.be.a.Number();
    expect(res.body.name).to.eql(debitorName);
  });

  it('should add tenant with same name twice', async () => {
    const clientId = await setupClientInDb();
    const debitorName = 'TestDebitor1';
    await createDebitorViaHttp(clientId, debitorName);
    const res = await createDebitorViaHttp(clientId, debitorName)
      .expect(200)
      .expect('Content-Type', 'application/json');
    expect(res.body.id).to.be.a.Number();
    expect(res.body.name).to.eql(debitorName);
    const debitorRepository = await app.getRepository(TenantRepository);
    const debitorsFromDb = await debitorRepository.find({
      where: {clientId: clientId},
    });
    expect(debitorsFromDb).length(2);
  });

  async function clearDatabase() {
    await givenEmptyDatabase(app);
  }

  async function setupClientInDb(): Promise<number> {
    const clientRepository = await app.getRepository(ClientRepository);
    const clientFromDb = await clientRepository.create({name: 'TestClient1'});
    return clientFromDb.id;
  }

  function createDebitorViaHttp(clientId: number, name: string) {
    return http
      .post('/tenants')
      .send({clientId: clientId, name: name})
      .set('Content-Type', 'application/json');
  }
});

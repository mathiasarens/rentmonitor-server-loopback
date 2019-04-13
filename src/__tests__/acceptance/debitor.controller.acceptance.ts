import {Client, expect} from '@loopback/testlab';
import {RentmonitorServerApplication} from '../..';
import {setupApplication, givenEmptyDatabase} from './test-helper';
import {ClientRepository, DebitorRepository} from '../../repositories';

describe('DebitorController', () => {
  let app: RentmonitorServerApplication;
  let http: Client;

  before('setupApplication', async () => {
    ({app, client: http} = await setupApplication());
  });

  beforeEach(clearDatabase);

  after(async () => {
    await app.stop();
  });

  it('should add new debitor on post', async () => {
    const clientId = await setupClientInDb();
    const debitorName = 'TestDebitor1';
    const res = await createDebitorViaHttp(clientId, debitorName)
      .expect(200)
      .expect('Content-Type', 'application/json');
    expect(res.body.id).to.be.a.Number();
    expect(res.body.name).to.eql(debitorName);
  });

  it('should add debitor with same name twice', async () => {
    const clientId = await setupClientInDb();
    const debitorName = 'TestDebitor1';
    await createDebitorViaHttp(clientId, debitorName);
    const res = await createDebitorViaHttp(clientId, debitorName)
      .expect(200)
      .expect('Content-Type', 'application/json');
    expect(res.body.id).to.be.a.Number();
    expect(res.body.name).to.eql(debitorName);
    let debitorRepository = await app.getRepository(DebitorRepository);
    let debitorsFromDb = await debitorRepository.find({
      where: {clientId: clientId},
    });
    expect(debitorsFromDb).length(2);
  });

  async function clearDatabase() {
    await givenEmptyDatabase(app);
  }

  async function setupClientInDb(): Promise<number> {
    let clientRepository = await app.getRepository(ClientRepository);
    let clientFromDb = await clientRepository.create({name: 'TestClient1'});
    return clientFromDb.id;
  }

  function createDebitorViaHttp(clientId: number, name: string) {
    return http
      .post('/debitors')
      .send({clientId: clientId, name: name})
      .set('Content-Type', 'application/json');
  }
});

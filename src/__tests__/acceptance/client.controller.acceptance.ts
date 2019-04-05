import {Client, expect} from '@loopback/testlab';
import {RentmonitorServerApplication} from '../..';
import {setupApplication} from './test-helper';
import {RentmonitorDataSource} from '../../../src/datasources/rentmonitor.datasource';
import {ClientRepository} from '../../../src/repositories/client.repository';

describe('ClientController', () => {
  let app: RentmonitorServerApplication;
  let client: Client;
  const clientRepo = new ClientRepository(new RentmonitorDataSource());

  before('setupApplication', async () => {
    ({app, client} = await setupApplication());
  });

  beforeEach(clearDatabase);

  after(async () => {
    await app.stop();
  });

  it('should add new client on post', async () => {
    const clientName = 'TestClient1';
    const res = await createClient(clientName)
      .expect(200)
      .expect('Content-Type', 'application/json');
    expect(res.body.id).to.be.a.Number();
    expect(res.body.name).to.eql(clientName);
  });

  it('should return 400 if adding same client name twice', async () => {
    const clientName = 'TestClient1';
    await createClient(clientName).expect(200);
    const res = await createClient(clientName)
      .expect(400)
      .expect('Content-Type', 'application/json; charset=utf-8');
    expect(res.body.error.statusCode).to.eql(400);
    expect(res.body.error.name).to.eql('BadRequestError');
    expect(res.body.error.message).to.eql(
      "Client name: 'TestClient1' already exists",
    );
  });

  async function clearDatabase() {
    await clientRepo.deleteAll();
  }

  function createClient(name: string) {
    return client
      .post('/clients')
      .send({name: name})
      .set('Content-Type', 'application/json');
  }
});

import {Client, expect} from '@loopback/testlab';
import {RentmonitorServerApplication} from '../..';
import {setupApplication} from './test-helper';
import {testdb} from '../fixtures/datasources/testdb.datasource';
import {ClientRepository} from '../../src/repositories/client.repository';

describe('ClientController', () => {
  let app: RentmonitorServerApplication;
  let client: Client;
  const clientRepo = new ClientRepository(testdb);

  before('setupApplication', async () => {
    ({app, client} = await setupApplication());
  });

  beforeEach(clearDatabase);

  after(async () => {
    await app.stop();
  });

  it('add client on post', async () => {
    const res = await client
      .post('/clients')
      .send({name: 'TestClient1'})
      .set('Content-Type', 'application/json')
      .expect(200)
      .expect('Content-Type', 'application/json');
    expect(res.body.id).to.be.a.Number();
    expect(res.body.name).to.eql('TestClient1');
  });

  async function clearDatabase() {
    await clientRepo.deleteAll();
  }
});

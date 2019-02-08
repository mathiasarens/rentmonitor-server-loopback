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

  // it('add client on post', async () => {
  //   const res = await client
  //     .post('/clients')
  //     .send({name: 'TestClient1'})
  //     .set('Content-Type', 'application/json')
  //     .expect(201);
  //   expect(res.body).to.containEql({greeting: 'Hello from LoopBack'});
  // });

  async function clearDatabase() {
    await clientRepo.deleteAll();
  }
});

import {Client, expect} from '@loopback/testlab';
import {RentmonitorServerApplication} from '../..';
import {ClientRepository} from '../../repositories';
import {givenEmptyDatabase, setupApplication} from './test-helper';

describe('AccountSettingsController Acceptence Test', () => {
  let app: RentmonitorServerApplication;
  let http: Client;

  before('setupApplication', async () => {
    ({app, client: http} = await setupApplication());
  });

  beforeEach(clearDatabase);

  after(async () => {
    await app.stop();
  });

  it('should add new account-settings on post', async () => {
    const clientId = await setupClientInDb();
    const name = 'Konto1';
    const fintsBlz = '41627645';
    const fintsUrl = 'https://fints.gad.de/fints';
    const fintsUser = 'IDG498345';
    const fintsPassword = 'utF7$30§';
    const res = await createAccountSettingsViaHttp({
      clientId: clientId,
      name: name,
      fintsBlz: fintsBlz,
      fintsUrl: fintsUrl,
      fintsUser: fintsUser,
      fintsPassword: fintsPassword,
    })
      .expect(200)
      .expect('Content-Type', 'application/json');
    expect(res.body.id).to.be.a.Number();
    expect(res.body.clientId).to.eql(clientId);
    expect(res.body.name).to.eql(name);
    expect(res.body.fintsBlz).to.eql(fintsBlz);
    expect(res.body.fintsUrl).to.eql(fintsUrl);
    expect(res.body.fintsUser).to.eql(fintsUser);
    expect(res.body.fintsPassword).to.be.empty();
  });

  it('should return newly created account-settings on get', async () => {
    const clientId = await setupClientInDb();
    const name = 'Konto1';
    const fintsBlz = '41627645';
    const fintsUrl = 'https://fints.gad.de/fints';
    const fintsUser = 'IDG498345';
    const fintsPassword = 'utF7$30§';
    const createRes = await createAccountSettingsViaHttp({
      clientId: clientId,
      name: name,
      fintsBlz: fintsBlz,
      fintsUrl: fintsUrl,
      fintsUser: fintsUser,
      fintsPassword: fintsPassword,
    })
      .expect(200)
      .expect('Content-Type', 'application/json');
    expect(createRes.body.id).to.be.a.Number();
    const accountSettingsId = createRes.body.id;

    // when
    const res = await http
      .get('/account-settings')
      .expect(200)
      .expect('Content-Type', 'application/json');

    expect(res.body.length).to.eql(1);
    expect(res.body[0].id).to.eql(accountSettingsId);
    expect(res.body[0].clientId).to.eql(clientId);
    expect(res.body[0].name).to.eql(name);
    expect(res.body[0].fintsBlz).to.eql(fintsBlz);
    expect(res.body[0].fintsUrl).to.eql(fintsUrl);
    expect(res.body[0].fintsUser).to.eql(fintsUser);
    expect(res.body[0].fintsPassword).to.be.empty();
  });

  it('should return empty result on get', async () => {
    await setupClientInDb();

    // when
    const res = await http
      .get('/account-settings')
      .expect(200)
      .expect('Content-Type', 'application/json');

    expect(res.body.length).to.eql(0);
  });

  async function clearDatabase() {
    await givenEmptyDatabase(app);
  }

  async function setupClientInDb(): Promise<number> {
    const clientRepository = await app.getRepository(ClientRepository);
    const clientFromDb = await clientRepository.create({name: 'TestClient1'});
    return clientFromDb.id;
  }

  function createAccountSettingsViaHttp(data: {}) {
    return http
      .post('/account-settings')
      .send(data)
      .set('Content-Type', 'application/json');
  }
});
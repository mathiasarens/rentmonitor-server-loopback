import {Client, expect} from '@loopback/testlab';
import {RentmonitorServerApplication} from '../..';
import {
  clearDatabase,
  getTestUser,
  login,
  setupApplication,
  setupClientInDb,
  setupUserInDb,
} from '../helpers/acceptance-test.helpers';

describe('AccountSettingsController Acceptence Test', () => {
  let app: RentmonitorServerApplication;
  let http: Client;

  before('setupApplication', async () => {
    ({app, client: http} = await setupApplication());
  });
  beforeEach(async () => {
    await clearDatabase(app);
  });

  after(async () => {
    await app.stop();
  });

  it('should add new account-settings on post', async () => {
    const clientId = await setupClientInDb(app, 'TestClient1');
    const testUser = getTestUser('1');
    await setupUserInDb(app, clientId, testUser);
    const name = 'Konto1';
    const fintsBlz = '41627645';
    const fintsUrl = 'https://fints.gad.de/fints';
    const fintsUser = 'IDG498345';
    const fintsPassword = 'utF7$30§';
    const token = await login(http, testUser);
    const res = await createAccountSettingsViaHttp(token, {
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

  it('should return 422 on create with clientId', async () => {
    const clientId = await setupClientInDb(app, 'TestClient1');
    const testUser = getTestUser('2');
    await setupUserInDb(app, clientId, testUser);
    const token = await login(http, testUser);
    const name = 'Konto1';
    const fintsBlz = '41627645';
    const fintsUrl = 'https://fints.gad.de/fints';
    const fintsUser = 'IDG498345';
    const fintsPassword = 'utF7$30§';

    //when
    await createAccountSettingsViaHttp(token, {
      name: name,
      clientId: clientId,
      fintsBlz: fintsBlz,
      fintsUrl: fintsUrl,
      fintsUser: fintsUser,
      fintsPassword: fintsPassword,
    })
      .expect(422)
      .expect('Content-Type', 'application/json; charset=utf-8');

    // then
    const res = await http
      .get('/account-settings')
      .set('Authorization', 'Bearer ' + token)
      .expect(200)
      .expect('Content-Type', 'application/json');

    expect(res.body.length).to.eql(0);
  });

  it('should return newly created account-settings on get', async () => {
    const clientId = await setupClientInDb(app, 'TestClient1');
    const testUser = getTestUser('2');
    await setupUserInDb(app, clientId, testUser);
    const token = await login(http, testUser);
    const name = 'Konto1';
    const fintsBlz = '41627645';
    const fintsUrl = 'https://fints.gad.de/fints';
    const fintsUser = 'IDG498345';
    const fintsPassword = 'utF7$30§';
    const createRes = await createAccountSettingsViaHttp(token, {
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
      .set('Authorization', 'Bearer ' + token)
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

  it('should not allow to count account settings from other clients', async () => {
    const clientId1 = await setupClientInDb(app, 'TestClient1');
    const testUser1 = getTestUser('4');
    await setupUserInDb(app, clientId1, testUser1);
    const clientId2 = await setupClientInDb(app, 'TestClient2');
    const testUser2 = getTestUser('5');
    await setupUserInDb(app, clientId2, testUser2);
    const token1 = await login(http, testUser1);
    const token2 = await login(http, testUser2);

    const name1 = 'Konto1';
    const fintsBlz1 = '41627645';
    const fintsUrl1 = 'https://fints.gad.de/fints';
    const fintsUser1 = 'IDG498345';
    const fintsPassword1 = 'utF7$30§';
    await createAccountSettingsViaHttp(token1, {
      name: name1,
      fintsBlz: fintsBlz1,
      fintsUrl: fintsUrl1,
      fintsUser: fintsUser1,
      fintsPassword: fintsPassword1,
    })
      .expect(200)
      .expect('Content-Type', 'application/json');

    const name2 = 'Konto1';
    const fintsBlz2 = '12345678';
    const fintsUrl2 = 'https://fints.gad.de/fints';
    const fintsUser2 = 'WLI4984536';
    const fintsPassword2 = '1aTgs7$3';
    await createAccountSettingsViaHttp(token2, {
      name: name2,
      fintsBlz: fintsBlz2,
      fintsUrl: fintsUrl2,
      fintsUser: fintsUser2,
      fintsPassword: fintsPassword2,
    })
      .expect(200)
      .expect('Content-Type', 'application/json');

    // when
    const res = await http
      .get(`/account-settings/count?where[clientId]=${clientId2}`)
      .set('Authorization', 'Bearer ' + token1)
      .expect(200)
      .expect('Content-Type', 'application/json');

    expect(res.body.count).to.eql(0);
  });

  it('should return empty result on get', async () => {
    const clientId = await setupClientInDb(app, 'TestClient1');
    const testUser = getTestUser('3');
    await setupUserInDb(app, clientId, testUser);
    const token = await login(http, testUser);

    // when
    const res = await http
      .get('/account-settings')
      .set('Authorization', 'Bearer ' + token)
      .expect(200)
      .expect('Content-Type', 'application/json');

    expect(res.body.length).to.eql(0);
  });

  it('should return return data for both clients', async () => {
    const {
      token1,
      fintsName1,
      fintsUrl1,
      token2,
      fintsName2,
      fintsUrl2,
    } = await setup2();
    // when
    const res1 = await http
      .get('/account-settings')
      .set('Authorization', 'Bearer ' + token1)
      .expect(200)
      .expect('Content-Type', 'application/json');

    expect(res1.body.length).to.eql(1);
    expect(res1.body[0].name).to.eql(fintsName1);
    expect(res1.body[0].fintsUrl).to.eql(fintsUrl1);
    expect(res1.body[0].fintsPassword).to.be.empty();

    // when
    const res2 = await http
      .get('/account-settings')
      .set('Authorization', 'Bearer ' + token2)
      .expect(200)
      .expect('Content-Type', 'application/json');

    expect(res2.body.length).to.eql(1);
    expect(res2.body[0].name).to.eql(fintsName2);
    expect(res2.body[0].fintsUrl).to.eql(fintsUrl2);
    expect(res2.body[0].fintsPassword).to.be.empty();
  });

  it('should return no data on get if user filtered for a different clientId', async () => {
    const {token1, clientId2} = await setup2();
    // when
    const res = await http
      .get('/account-settings?filter[where][clientId]=' + clientId2)
      .set('Authorization', 'Bearer ' + token1)
      .expect(200)
      .expect('Content-Type', 'application/json');

    expect(res.body.length).to.eql(0);
  });

  it('should not return data from another client on get by filtering for a different id', async () => {
    const {token1, accountSettingsResult2} = await setup2();

    // when
    const res = await http
      .get(
        '/account-settings?filter[where][id]=' + accountSettingsResult2.body.id,
      )
      .set('Authorization', 'Bearer ' + token1)
      .expect(200)
      .expect('Content-Type', 'application/json');

    expect(res.body.length).to.eql(0);
  });

  it('should patch account settings only for current client', async () => {
    const {
      token1,
      fintsName1,
      fintsUrl1,
      token2,
      fintsName2,
      fintsUrl2,
    } = await setup2();

    // when
    await http
      .patch('/account-settings')
      .set('Authorization', 'Bearer ' + token2)
      .set('Content-Type', 'application/json')
      .send({fintsUser: 'newUser', fintsPassword: 'newPassword'})
      .expect(200)
      .expect('Content-Type', 'application/json');

    const res1 = await http
      .get('/account-settings')
      .set('Authorization', 'Bearer ' + token1)
      .expect(200)
      .expect('Content-Type', 'application/json');

    expect(res1.body.length).to.eql(1);
    expect(res1.body[0].name).to.eql(fintsName1);
    expect(res1.body[0].fintsUrl).to.eql(fintsUrl1);
    expect(res1.body[0].fintsPassword).to.be.empty();

    const res2 = await http
      .get('/account-settings')
      .set('Authorization', 'Bearer ' + token2)
      .expect(200)
      .expect('Content-Type', 'application/json');

    expect(res2.body.length).to.eql(1);
    expect(res2.body[0].name).to.eql(fintsName2);
    expect(res2.body[0].fintsUrl).to.eql(fintsUrl2);
    expect(res2.body[0].fintsUser).to.eql('newUser');
    expect(res2.body[0].fintsPassword).to.be.empty();
  });

  it('should not allow to patch account settings for another client', async () => {
    const {
      clientId1,
      token1,
      fintsName1,
      fintsUrl1,
      token2,
      fintsName2,
      fintsUrl2,
    } = await setup2();

    // when
    await http
      .patch('/account-settings')
      .set('Authorization', 'Bearer ' + token2)
      .set('Content-Type', 'application/json')
      .send({clientId: clientId1, fintsUrl: 'http://fints-url.com'})
      .expect(422)
      .expect('Content-Type', 'application/json; charset=utf-8');

    const res1 = await http
      .get('/account-settings')
      .set('Authorization', 'Bearer ' + token1)
      .expect(200)
      .expect('Content-Type', 'application/json');

    expect(res1.body.length).to.eql(1);
    expect(res1.body[0].name).to.eql(fintsName1);
    expect(res1.body[0].fintsUrl).to.eql(fintsUrl1);
    expect(res1.body[0].fintsPassword).to.be.empty();

    const res2 = await http
      .get('/account-settings')
      .set('Authorization', 'Bearer ' + token2)
      .expect(200)
      .expect('Content-Type', 'application/json');

    expect(res2.body.length).to.eql(1);
    expect(res2.body[0].name).to.eql(fintsName2);
    expect(res2.body[0].fintsUrl).to.eql(fintsUrl2);
    expect(res2.body[0].fintsPassword).to.be.empty();
  });

  it('should not allow to patch account settings for another client using where clause', async () => {
    const {
      clientId1,
      token1,
      fintsName1,
      fintsUrl1,
      token2,
      fintsName2,
      fintsUrl2,
    } = await setup2();

    // when
    const res = await http
      .patch('/account-settings?where[clientId]=' + clientId1)
      .set('Authorization', 'Bearer ' + token2)
      .set('Content-Type', 'application/json')
      .send({fintsUrl: 'http://fints-url.com'})
      .expect(200)
      .expect('Content-Type', 'application/json');
    expect(res.body.count).to.eql(0);

    const res1 = await http
      .get('/account-settings')
      .set('Authorization', 'Bearer ' + token1)
      .expect(200)
      .expect('Content-Type', 'application/json');

    expect(res1.body.length).to.eql(1);
    expect(res1.body[0].name).to.eql(fintsName1);
    expect(res1.body[0].fintsUrl).to.eql(fintsUrl1);
    expect(res1.body[0].fintsPassword).to.be.empty();

    const res2 = await http
      .get('/account-settings')
      .set('Authorization', 'Bearer ' + token2)
      .expect(200)
      .expect('Content-Type', 'application/json');

    expect(res2.body.length).to.eql(1);
    expect(res2.body[0].name).to.eql(fintsName2);
    expect(res2.body[0].fintsUrl).to.eql(fintsUrl2);
    expect(res2.body[0].fintsPassword).to.be.empty();
  });

  it('should not allow to find account settings for another client by id', async () => {
    const {accountSettingsResult1, token2} = await setup2();

    // when
    await http
      .get('/account-settings/' + accountSettingsResult1.body.id)
      .set('Authorization', 'Bearer ' + token2)
      .expect(204);
  });

  it('should find account settings for the same client by id', async () => {
    const {
      fintsName2,
      fintsUrl2,
      accountSettingsResult2,
      token2,
    } = await setup2();

    // when
    const res1 = await http
      .get('/account-settings/' + accountSettingsResult2.body.id)
      .set('Authorization', 'Bearer ' + token2)
      .expect(200)
      .expect('Content-Type', 'application/json');

    expect(res1.body.name).to.eql(fintsName2);
    expect(res1.body.fintsUrl).to.eql(fintsUrl2);
    expect(res1.body.fintsPassword).to.be.empty();
  });

  it('should not allow to patch a single account settings from another client by id', async () => {
    const {
      clientId1,
      token1,
      fintsName1,
      fintsUrl1,
      token2,
      fintsName2,
      fintsUrl2,
      accountSettingsResult2,
    } = await setup2();

    // when
    await http
      .patch(`/account-settings/${accountSettingsResult2.body.id}`)
      .set('Authorization', 'Bearer ' + token1)
      .set('Content-Type', 'application/json')
      .send({clientId: clientId1, fintsUrl: 'http://fints-url.com'})
      .expect(422)
      .expect('Content-Type', 'application/json; charset=utf-8');

    const res1 = await http
      .get('/account-settings')
      .set('Authorization', 'Bearer ' + token1)
      .expect(200)
      .expect('Content-Type', 'application/json');

    expect(res1.body.length).to.eql(1);
    expect(res1.body[0].name).to.eql(fintsName1);
    expect(res1.body[0].fintsUrl).to.eql(fintsUrl1);
    expect(res1.body[0].fintsPassword).to.be.empty();

    const res2 = await http
      .get('/account-settings')
      .set('Authorization', 'Bearer ' + token2)
      .expect(200)
      .expect('Content-Type', 'application/json');

    expect(res2.body.length).to.eql(1);
    expect(res2.body[0].name).to.eql(fintsName2);
    expect(res2.body[0].fintsUrl).to.eql(fintsUrl2);
    expect(res2.body[0].fintsPassword).to.be.empty();
  });

  it('should put a single account settings by id', async () => {
    const {
      token1,
      fintsName1,
      fintsUrl1,
      token2,
      accountSettingsResult2,
    } = await setup2();

    // when
    await http
      .put(`/account-settings/${accountSettingsResult2.body.id}`)
      .set('Authorization', 'Bearer ' + token2)
      .set('Content-Type', 'application/json')
      .send({
        id: accountSettingsResult2.body.id,
        name: 'New Account',
        fintsUrl: 'http://fints-url.com',
        fintsBlz: '9876543',
        fintsUser: 'user2',
        fintsPassword: 'new password',
      })
      .expect(204);

    const res1 = await http
      .get('/account-settings')
      .set('Authorization', 'Bearer ' + token1)
      .expect(200)
      .expect('Content-Type', 'application/json');

    expect(res1.body.length).to.eql(1);
    expect(res1.body[0].name).to.eql(fintsName1);
    expect(res1.body[0].fintsUrl).to.eql(fintsUrl1);
    expect(res1.body[0].fintsPassword).to.be.empty();

    const res2 = await http
      .get('/account-settings')
      .set('Authorization', 'Bearer ' + token2)
      .expect(200)
      .expect('Content-Type', 'application/json');

    expect(res2.body.length).to.eql(1);
    expect(res2.body[0].name).to.eql('New Account');
    expect(res2.body[0].fintsUrl).to.eql('http://fints-url.com');
    expect(res2.body[0].fintsBlz).to.eql('9876543');
    expect(res2.body[0].fintsUser).to.eql('user2');
  });

  it('should not allow to put a single account settings to another client by id', async () => {
    const {
      token1,
      fintsName1,
      fintsUrl1,
      token2,
      fintsName2,
      fintsUrl2,
      accountSettingsResult2,
    } = await setup2();

    // when
    await http
      .put(`/account-settings/${accountSettingsResult2.body.id}`)
      .set('Authorization', 'Bearer ' + token1)
      .set('Content-Type', 'application/json')
      .send({
        id: accountSettingsResult2.body.id,
        name: 'New Account',
        fintsUrl: 'http://fints-url.com',
        fintsBlz: '9876543',
        fintsUser: 'user1',
        fintsPassword: 'new password',
      })
      .expect(422);

    const res1 = await http
      .get('/account-settings')
      .set('Authorization', 'Bearer ' + token1)
      .expect(200)
      .expect('Content-Type', 'application/json');

    expect(res1.body.length).to.eql(1);
    expect(res1.body[0].name).to.eql(fintsName1);
    expect(res1.body[0].fintsUrl).to.eql(fintsUrl1);
    expect(res1.body[0].fintsPassword).to.be.empty();

    const res2 = await http
      .get('/account-settings')
      .set('Authorization', 'Bearer ' + token2)
      .expect(200)
      .expect('Content-Type', 'application/json');

    expect(res2.body.length).to.eql(1);
    expect(res2.body[0].name).to.eql(fintsName2);
    expect(res2.body[0].fintsUrl).to.eql(fintsUrl2);
  });

  it('should delete a single account settings object by id', async () => {
    const {
      token1,
      token2,
      fintsName2,
      fintsUrl2,
      accountSettingsResult1,
    } = await setup2();

    // when
    await http
      .del(`/account-settings/${accountSettingsResult1.body.id}`)
      .set('Authorization', 'Bearer ' + token1)
      .expect(204);

    const res1 = await http
      .get('/account-settings')
      .set('Authorization', 'Bearer ' + token1)
      .expect(200);

    expect(res1.body.length).to.eql(0);

    const res2 = await http
      .get('/account-settings')
      .set('Authorization', 'Bearer ' + token2)
      .expect(200)
      .expect('Content-Type', 'application/json');

    expect(res2.body.length).to.eql(1);
    expect(res2.body[0].name).to.eql(fintsName2);
    expect(res2.body[0].fintsUrl).to.eql(fintsUrl2);
    expect(res2.body[0].fintsPassword).to.be.empty();
  });

  it('should not allow to delete a single account settings of another client by id', async () => {
    const {
      token1,
      fintsName1,
      fintsUrl1,
      token2,
      fintsName2,
      fintsUrl2,
      accountSettingsResult2,
    } = await setup2();

    // when
    await http
      .del(`/account-settings/${accountSettingsResult2.body.id}`)
      .set('Authorization', 'Bearer ' + token1)
      .expect(204);

    const res1 = await http
      .get('/account-settings')
      .set('Authorization', 'Bearer ' + token1)
      .expect(200)
      .expect('Content-Type', 'application/json');

    expect(res1.body.length).to.eql(1);
    expect(res1.body[0].name).to.eql(fintsName1);
    expect(res1.body[0].fintsUrl).to.eql(fintsUrl1);
    expect(res1.body[0].fintsPassword).to.be.empty();

    const res2 = await http
      .get('/account-settings')
      .set('Authorization', 'Bearer ' + token2)
      .expect(200)
      .expect('Content-Type', 'application/json');

    expect(res2.body.length).to.eql(1);
    expect(res2.body[0].name).to.eql(fintsName2);
    expect(res2.body[0].fintsUrl).to.eql(fintsUrl2);
    expect(res2.body[0].fintsPassword).to.be.empty();
  });

  it('should return http status 209 on successful post to /account-settings/fints-accounts', async () => {
    const clientId = await setupClientInDb(app, 'TestClient1');
    const testUser = getTestUser('1');
    await setupUserInDb(app, clientId, testUser);
    const name = 'Konto1';
    const fintsBlz = '41627645';
    const fintsUrl = 'https://fints.gad.de/fints';
    const fintsUser = 'IDG498345';
    const fintsPassword = 'utF7$30§';
    const token = await login(http, testUser);
    const res = await http
      .post('/account-settings/fints-accounts')
      .set('Authorization', 'Bearer ' + token)
      .set('Content-Type', 'application/json')
      .send({
        name: name,
        fintsBlz: fintsBlz,
        fintsUrl: fintsUrl,
        fintsUser: fintsUser,
        fintsPassword: fintsPassword,
      })
      .expect(209)
      .expect('Content-Type', 'application/json');
    expect(res.body[0].rawstring).to.eql('rawString1');
    expect(res.body[0].name).to.eql('name1');
    expect(res.body[0].iban).to.eql('iban1');
    expect(res.body[0].bic).to.eql('bic1');
  });

  it('should return http status 210 if tan required on post to /account-settings/fints-accounts', async () => {
    const clientId = await setupClientInDb(app, 'TestClient1');
    const testUser = getTestUser('1');
    await setupUserInDb(app, clientId, testUser);
    const name = 'Konto1';
    const fintsBlz = '41627645';
    const fintsUrl = 'https://fints.gad.de/fints';
    const fintsUser = 'TanRequired';
    const fintsPassword = 'utF7$30§';
    const token = await login(http, testUser);
    const res = await http
      .post('/account-settings/fints-accounts')
      .set('Authorization', 'Bearer ' + token)
      .set('Content-Type', 'application/json')
      .send({
        name: name,
        fintsBlz: fintsBlz,
        fintsUrl: fintsUrl,
        fintsUser: fintsUser,
        fintsPassword: fintsPassword,
      })
      .expect(210)
      .expect('Content-Type', 'application/json');
    expect(res.body.challengeMediaBase64).to.eql('bWVkaWEx');
  });

  // non test methods --------------------------------------------------------------------

  function createAccountSettingsViaHttp(token: string, data: {}) {
    return http
      .post('/account-settings')
      .set('Authorization', 'Bearer ' + token)
      .send(data)
      .set('Content-Type', 'application/json');
  }

  async function setup2() {
    const clientId1 = await setupClientInDb(app, 'TestClient1');
    const testUser1 = getTestUser('1');
    await setupUserInDb(app, clientId1, testUser1);
    const clientId2 = await setupClientInDb(app, 'TestClient2');
    const testUser2 = getTestUser('2');
    await setupUserInDb(app, clientId2, testUser2);
    const token1 = await login(http, testUser1);
    const token2 = await login(http, testUser2);

    const name1 = 'Konto1';
    const fintsBlz1 = '41627645';
    const fintsUrl1 = 'https://fints.gad.de/fints1';
    const fintsUser1 = 'IDG498345';
    const fintsPassword1 = 'utF7$30§';
    const accountSettingsResult1 = await createAccountSettingsViaHttp(token1, {
      name: name1,
      fintsBlz: fintsBlz1,
      fintsUrl: fintsUrl1,
      fintsUser: fintsUser1,
      fintsPassword: fintsPassword1,
    })
      .expect(200)
      .expect('Content-Type', 'application/json');

    const name2 = 'Konto2';
    const fintsBlz2 = '12345678';
    const fintsUrl2 = 'https://fints.gad.de/fints2';
    const fintsUser2 = 'WLI4984536';
    const fintsPassword2 = '1aTgs7$3';
    const accountSettingsResult2 = await createAccountSettingsViaHttp(token2, {
      name: name2,
      fintsBlz: fintsBlz2,
      fintsUrl: fintsUrl2,
      fintsUser: fintsUser2,
      fintsPassword: fintsPassword2,
    })
      .expect(200)
      .expect('Content-Type', 'application/json');

    return {
      clientId1: clientId1,
      testUser1: testUser1,
      token1: token1,
      fintsName1: name1,
      fintsUrl1: fintsUrl1,
      fintsBlz1: fintsBlz1,
      fintsUser1: fintsUser1,
      fintsPassword1: fintsPassword1,
      accountSettingsResult1: accountSettingsResult1,
      clientId2: clientId2,
      testUser2: testUser2,
      token2: token2,
      fintsName2: name2,
      fintsUrl2: fintsUrl2,
      fintsBlz2: fintsBlz2,
      fintsUser2: fintsUser2,
      fintsPassword2: fintsPassword2,
      accountSettingsResult2: accountSettingsResult2,
    };
  }
});

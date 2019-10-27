import {DataObject} from '@loopback/repository';
import {Client, expect} from '@loopback/testlab';
import {RentmonitorServerApplication} from '../..';
import {PasswordHasherBindings} from '../../keys';
import {User} from '../../models';
import {ClientRepository, UserRepository} from '../../repositories';
import {PasswordHasher} from '../../services/authentication/hash.password.bcryptjs';
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
    const clientId = await setupClientInDb('TestClient1');
    const testUser = getTestUser('1');
    await setupUserInDb(clientId, testUser);
    const name = 'Konto1';
    const fintsBlz = '41627645';
    const fintsUrl = 'https://fints.gad.de/fints';
    const fintsUser = 'IDG498345';
    const fintsPassword = 'utF7$30§';
    const token = await login(testUser);
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

  it('should return newly created account-settings on get', async () => {
    const clientId = await setupClientInDb('TestClient1');
    const testUser = getTestUser('2');
    await setupUserInDb(clientId, testUser);
    const token = await login(testUser);
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

  it('should return empty result on get', async () => {
    const clientId = await setupClientInDb('TestClient1');
    const testUser = getTestUser('3');
    await setupUserInDb(clientId, testUser);
    const token = await login(testUser);

    // when
    const res = await http
      .get('/account-settings')
      .set('Authorization', 'Bearer ' + token)
      .expect(200)
      .expect('Content-Type', 'application/json');

    expect(res.body.length).to.eql(0);
  });

  it('should not allow to count account settings from other clients', async () => {
    const clientId1 = await setupClientInDb('TestClient1');
    const testUser1 = getTestUser('4');
    await setupUserInDb(clientId1, testUser1);
    const clientId2 = await setupClientInDb('TestClient2');
    const testUser2 = getTestUser('5');
    await setupUserInDb(clientId2, testUser2);
    const token1 = await login(testUser1);
    const token2 = await login(testUser2);

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

    expect(res.body.count).to.eql(1);
  });

  it('should not allow to patch a single account settings from another client', async () => {
    const clientId1 = await setupClientInDb('TestClient1');
    const testUser1 = getTestUser('6');
    await setupUserInDb(clientId1, testUser1);
    const clientId2 = await setupClientInDb('TestClient2');
    const testUser2 = getTestUser('7');
    await setupUserInDb(clientId2, testUser2);
    const token1 = await login(testUser1);
    const token2 = await login(testUser2);

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

    const name2 = 'Konto2';
    const fintsBlz2 = '12345678';
    const fintsUrl2 = 'https://fints.gad.de/fints';
    const fintsUser2 = 'WLI4984536';
    const fintsPassword2 = '1aTgs7$3';
    const accountSettings2Result = await createAccountSettingsViaHttp(token2, {
      name: name2,
      fintsBlz: fintsBlz2,
      fintsUrl: fintsUrl2,
      fintsUser: fintsUser2,
      fintsPassword: fintsPassword2,
    })
      .expect(200)
      .expect('Content-Type', 'application/json');

    // when
    await http
      .patch(`/account-settings/${accountSettings2Result.body.id}`)
      .set('Authorization', 'Bearer ' + token1)
      .set('Content-Type', 'application/json')
      .send({clientId: clientId1})
      .expect(204);

    const res = await http
      .get('/account-settings')
      .set('Authorization', 'Bearer ' + token1)
      .expect(200)
      .expect('Content-Type', 'application/json');

    expect(res.body.length).to.eql(1);
  });

  it('should not allow to patch a single account settings to a different clientId', async () => {
    const clientId1 = await setupClientInDb('TestClient1');
    const testUser1 = getTestUser('6');
    await setupUserInDb(clientId1, testUser1);
    const clientId2 = await setupClientInDb('TestClient2');
    const testUser2 = getTestUser('7');
    await setupUserInDb(clientId2, testUser2);
    const token1 = await login(testUser1);
    const token2 = await login(testUser2);

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

    const name2 = 'Konto2';
    const fintsBlz2 = '12345678';
    const fintsUrl2 = 'https://fints.gad.de/fints';
    const fintsUser2 = 'WLI4984536';
    const fintsPassword2 = '1aTgs7$3';
    const accountSettings2Result = await createAccountSettingsViaHttp(token2, {
      name: name2,
      fintsBlz: fintsBlz2,
      fintsUrl: fintsUrl2,
      fintsUser: fintsUser2,
      fintsPassword: fintsPassword2,
    })
      .expect(200)
      .expect('Content-Type', 'application/json');

    // when
    await http
      .patch(`/account-settings/${accountSettings2Result.body.id}`)
      .set('Authorization', 'Bearer ' + token2)
      .set('Content-Type', 'application/json')
      .send({clientId: clientId1})
      .expect(400);
  });
  // non test methods --------------------------------------------------------------------

  async function clearDatabase() {
    await givenEmptyDatabase(app);
  }

  async function setupClientInDb(name: string): Promise<number> {
    const clientRepository = await app.getRepository(ClientRepository);
    const clientFromDb = await clientRepository.create({name: name});
    return clientFromDb.id;
  }

  function createAccountSettingsViaHttp(token: string, data: {}) {
    return http
      .post('/account-settings')
      .set('Authorization', 'Bearer ' + token)
      .send(data)
      .set('Content-Type', 'application/json');
  }

  async function setupUserInDb(clientId: number, user: User) {
    const passwordHasher: PasswordHasher = await app.get(
      PasswordHasherBindings.PASSWORD_HASHER,
    );
    const encryptedPassword = await passwordHasher.hashPassword(user.password);
    const userRepository: UserRepository = await app.getRepository(
      UserRepository,
    );
    const newUser: DataObject<User> = Object.assign({}, user, {
      password: encryptedPassword,
      clientId: clientId,
    });
    const newUserFromDb = await userRepository.create(newUser);
    return newUserFromDb;
  }

  async function login(user: User): Promise<string> {
    const res = await http
      .post('/users/login')
      .send({email: user.email, password: user.password})
      .expect(200);

    const token = res.body.token;
    return token;
  }

  function getTestUser(testId: string): User {
    const testUser = Object.assign({}, new User(), {
      email: 'test@loopback' + testId + '.io',
      password: 'p4ssw0rd',
      firstName: 'Example',
      lastName: 'User ' + testId,
    });
    return testUser;
  }
});

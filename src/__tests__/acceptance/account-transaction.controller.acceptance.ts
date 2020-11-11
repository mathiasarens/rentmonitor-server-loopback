import {DataObject} from '@loopback/repository';
import {Client, expect} from '@loopback/testlab';
import {RentmonitorServerApplication} from '../..';
import {AccountTransactionUrl} from '../../controllers/account-transaction.controller';
import {PasswordHasherBindings} from '../../keys';
import {AccountTransaction, User} from '../../models';
import {
  AccountSettingsRepository,
  AccountTransactionRepository,
  ClientRepository,
  UserRepository,
} from '../../repositories';
import {PasswordHasher} from '../../services/authentication/hash.password.bcryptjs';
import {
  givenEmptyDatabase,
  setupApplication,
} from '../helpers/acceptance-test.helpers';

describe('AccountTransactionController Acceptence Test', () => {
  let app: RentmonitorServerApplication;
  let http: Client;

  before('setupApplication', async () => {
    ({app, client: http} = await setupApplication());
  });
  beforeEach(clearDatabase);

  after(async () => {
    await app.stop();
  });

  // count

  it('should not count account transactions from other clients', async () => {
    const clientId1 = await setupClientInDb('TestClient1');
    const testUser1 = getTestUser('4');
    await setupUserInDb(clientId1, testUser1);
    const clientId2 = await setupClientInDb('TestClient2');
    const testUser2 = getTestUser('5');
    await setupUserInDb(clientId2, testUser2);
    const token1 = await login(testUser1);
    const accountSettingsId2 = await setupAccountSettingsInDb(clientId2);
    const now = new Date();
    await setupAccountTransactionInDb({
      clientId: clientId2,
      accountSettingsId: accountSettingsId2,
      date: now,
      name: 'AccountTransaction',
    });

    // when
    const res = await http
      .get(`${AccountTransactionUrl}/count?where[clientId]=${clientId2}`)
      .set('Authorization', 'Bearer ' + token1)
      .expect(200)
      .expect('Content-Type', 'application/json');

    expect(res.body.count).to.eql(0);
  });

  // find

  it('should return empty result on get', async () => {
    const clientId = await setupClientInDb('TestClient1');
    const testUser = getTestUser('3');
    await setupUserInDb(clientId, testUser);
    const token = await login(testUser);

    // when
    const res = await http
      .get(AccountTransactionUrl)
      .set('Authorization', 'Bearer ' + token)
      .expect(200)
      .expect('Content-Type', 'application/json');

    expect(res.body.length).to.eql(0);
  });

  it('should return account transactions for each client only', async () => {
    const {
      token1,
      accountSettingsId1,
      accountTransactionId1,
      date1,
      name1,
      iban1,
      bic1,
      text1,
      amount1,
      token2,
      accountSettingsId2,
      accountTransactionId2,
      date2,
      name2,
      iban2,
      bic2,
      text2,
      amount2,
    } = await setup2();

    // when
    const res1 = await http
      .get(AccountTransactionUrl)
      .set('Authorization', 'Bearer ' + token1)
      .expect(200)
      .expect('Content-Type', 'application/json');

    expect(res1.body.length).to.eql(1);
    expect(res1.body[0].id).to.eql(accountTransactionId1);
    expect(res1.body[0].accountSettingsId).to.eql(accountSettingsId1);
    expect(res1.body[0].date).to.eql(date1.toJSON());
    expect(res1.body[0].name).to.be.eql(name1);
    expect(res1.body[0].iban).to.be.eql(iban1);
    expect(res1.body[0].bic).to.be.eql(bic1);
    expect(res1.body[0].text).to.be.eql(text1);
    expect(res1.body[0].amount).to.be.eql(amount1);

    // when
    const res2 = await http
      .get(AccountTransactionUrl)
      .set('Authorization', 'Bearer ' + token2)
      .expect(200)
      .expect('Content-Type', 'application/json');

    expect(res2.body.length).to.eql(1);
    expect(res2.body[0].id).to.eql(accountTransactionId2);
    expect(res2.body[0].accountSettingsId).to.eql(accountSettingsId2);
    expect(res2.body[0].date).to.be.eql(date2.toJSON());
    expect(res2.body[0].name).to.be.eql(name2);
    expect(res2.body[0].iban).to.be.eql(iban2);
    expect(res2.body[0].bic).to.be.eql(bic2);
    expect(res2.body[0].text).to.be.eql(text2);
    expect(res2.body[0].amount).to.be.eql(amount2);
  });

  it('should not return data from another client on get by filtering for a different clientId but for the same clientId', async () => {
    const {token1, clientId2} = await setup2();
    // when
    const res = await http
      .get(`${AccountTransactionUrl}?filter[where][clientId]=${clientId2}`)
      .set('Authorization', 'Bearer ' + token1)
      .expect(200)
      .expect('Content-Type', 'application/json');

    expect(res.body.length).to.eql(0);
  });

  it('should not return data from another client on get by filtering for a different id', async () => {
    const {token1, accountTransactionId2} = await setup2();

    // when
    const res = await http
      .get(
        `${AccountTransactionUrl}?filter[where][id]=${accountTransactionId2}`,
      )
      .set('Authorization', 'Bearer ' + token1)
      .expect(200)
      .expect('Content-Type', 'application/json');

    expect(res.body.length).to.eql(0);
  });

  // findById

  it('should not find account transaction for another client by id', async () => {
    const {accountTransactionId1, token2} = await setup2();

    // when
    await http
      .get(`${AccountTransactionUrl}/${accountTransactionId1}`)
      .set('Authorization', 'Bearer ' + token2)
      .expect(204);
  });

  it('should find account transaction for the same client by id', async () => {
    const {
      token2,
      accountTransactionId2,
      accountSettingsId2,
      date2,
      name2,
      iban2,
      bic2,
      text2,
      amount2,
    } = await setup2();

    // when
    const res1 = await http
      .get(`${AccountTransactionUrl}/${accountTransactionId2}`)
      .set('Authorization', 'Bearer ' + token2)
      .expect(200)
      .expect('Content-Type', 'application/json');

    expect(res1.body.id).to.eql(accountTransactionId2);
    expect(res1.body.accountSettingsId).to.eql(accountSettingsId2);
    expect(res1.body.date).to.be.eql(date2.toJSON());
    expect(res1.body.name).to.be.eql(name2);
    expect(res1.body.iban).to.be.eql(iban2);
    expect(res1.body.bic).to.be.eql(bic2);
    expect(res1.body.text).to.be.eql(text2);
    expect(res1.body.amount).to.be.eql(amount2);
  });

  // delete

  it('should delete a single account transaction object by id', async () => {
    const {
      token1,
      accountTransactionId1,
      token2,
      accountTransactionId2,
      accountSettingsId2,
      date2,
      name2,
      iban2,
      bic2,
      text2,
      amount2,
    } = await setup2();

    // when
    await http
      .del(`${AccountTransactionUrl}/${accountTransactionId1}`)
      .set('Authorization', 'Bearer ' + token1)
      .expect(204);

    const res1 = await http
      .get(AccountTransactionUrl)
      .set('Authorization', 'Bearer ' + token1)
      .expect(200);

    expect(res1.body.length).to.eql(0);

    const res2 = await http
      .get(AccountTransactionUrl)
      .set('Authorization', 'Bearer ' + token2)
      .expect(200)
      .expect('Content-Type', 'application/json');

    expect(res2.body.length).to.eql(1);
    expect(res2.body[0].id).to.eql(accountTransactionId2);
    expect(res2.body[0].accountSettingsId).to.eql(accountSettingsId2);
    expect(res2.body[0].date).to.eql(date2.toJSON());
    expect(res2.body[0].name).to.be.eql(name2);
    expect(res2.body[0].iban).to.be.eql(iban2);
    expect(res2.body[0].bic).to.be.eql(bic2);
    expect(res2.body[0].text).to.be.eql(text2);
    expect(res2.body[0].amount).to.be.eql(amount2);
  });

  it('should not allow to delete a single account settings of another client by id', async () => {
    const {
      token1,
      accountTransactionId1,
      token2,
      accountTransactionId2,
    } = await setup2();

    // when
    await http
      .del(`${AccountTransactionUrl}/${accountTransactionId2}`)
      .set('Authorization', 'Bearer ' + token1)
      .expect(204);

    const res1 = await http
      .get(AccountTransactionUrl)
      .set('Authorization', 'Bearer ' + token1)
      .expect(200)
      .expect('Content-Type', 'application/json');

    expect(res1.body.length).to.eql(1);
    expect(res1.body[0].id).to.eql(accountTransactionId1);

    const res2 = await http
      .get(AccountTransactionUrl)
      .set('Authorization', 'Bearer ' + token2)
      .expect(200)
      .expect('Content-Type', 'application/json');

    expect(res2.body.length).to.eql(1);
    expect(res2.body[0].id).to.eql(accountTransactionId2);
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

  async function setupAccountSettingsInDb(clientId: number): Promise<number> {
    const accountSettingsRepository = await app.getRepository(
      AccountSettingsRepository,
    );
    const accountSettingsFromDb = await accountSettingsRepository.create({
      clientId: clientId,
      name: `AccountSettings ${clientId}`,
    });
    return accountSettingsFromDb.id;
  }

  async function setupAccountTransactionInDb(
    data: DataObject<AccountTransaction>,
  ): Promise<AccountTransaction> {
    const accountTransactionRepository = await app.getRepository(
      AccountTransactionRepository,
    );
    const accountTransactionFromDb = await accountTransactionRepository.create(
      data,
    );
    return accountTransactionFromDb;
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

  async function setup2() {
    const clientId1 = await setupClientInDb('TestClient1');
    const testUser1 = getTestUser('1');
    await setupUserInDb(clientId1, testUser1);
    const clientId2 = await setupClientInDb('TestClient2');
    const testUser2 = getTestUser('2');
    await setupUserInDb(clientId2, testUser2);
    const token1 = await login(testUser1);
    const token2 = await login(testUser2);

    const accountSettingsId1 = await setupAccountSettingsInDb(clientId1);
    const accountSettingsId2 = await setupAccountSettingsInDb(clientId2);

    const date1 = new Date();
    const date2 = new Date();
    const name1 = 'Tenant1';
    const name2 = 'Tenant2';
    const iban1 = 'IBAN1';
    const iban2 = 'IBAN2';
    const bic1 = 'BIC1';
    const bic2 = 'BIC2';
    const text1 = 'Comment 1';
    const text2 = 'Comment 2';
    const amount1 = 1000;
    const amount2 = 2000;

    const accountTransaction1 = await setupAccountTransactionInDb({
      clientId: clientId1,
      accountSettingsId: accountSettingsId1,
      date: date1,
      name: name1,
      iban: iban1,
      bic: bic1,
      text: text1,
      amount: amount1,
    });
    const accountTransaction2 = await setupAccountTransactionInDb({
      clientId: clientId2,
      accountSettingsId: accountSettingsId2,
      date: date2,
      name: name2,
      iban: iban2,
      bic: bic2,
      text: text2,
      amount: amount2,
    });

    return {
      clientId1: clientId1,
      testUser1: testUser1,
      token1: token1,
      accountTransactionId1: accountTransaction1.id,
      accountSettingsId1: accountSettingsId1,
      date1: accountTransaction1.date,
      name1: name1,
      iban1: iban1,
      bic1: bic1,
      text1: text1,
      amount1: amount1,
      clientId2: clientId2,
      testUser2: testUser2,
      token2: token2,
      accountTransactionId2: accountTransaction2.id,
      accountSettingsId2: accountSettingsId2,
      date2: accountTransaction2.date,
      name2: name2,
      iban2: iban2,
      bic2: bic2,
      text2: text2,
      amount2: amount2,
    };
  }
});

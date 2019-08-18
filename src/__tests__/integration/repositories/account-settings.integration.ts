import {Getter} from '@loopback/context';
import {expect} from '@loopback/testlab';
import {Client} from '../../../models';
import {
  AccountSettingsRepository,
  ClientRepository,
} from '../../../repositories';
import {testdb} from '../../fixtures/datasources/rentmontior.datasource';
import {givenEmptyDatabase} from '../../helpers/database.helpers';

describe('Account Settings Repository Integration Tests', () => {
  let clientRepository: ClientRepository;
  let accountSettingsRepository: AccountSettingsRepository;

  beforeEach('setupApplication', async () => {
    await givenEmptyDatabase();

    clientRepository = new ClientRepository(testdb);
    const clientRepositoryGetter = Getter.fromValue(clientRepository);
    accountSettingsRepository = new AccountSettingsRepository(
      testdb,
      clientRepositoryGetter,
      'test_password',
    );
  });

  after(async () => {});

  it('should create accountSettings with fints params', async function() {
    // given
    const dbClient: Client = await clientRepository.create({
      name: 'Rentmonitor Test',
    });

    // when
    await accountSettingsRepository.create({
      clientId: dbClient.id,
      fintsBlz: '12345678',
      fintsUrl: 'https://fints.bank.com',
      fintsUser: 'login',
      fintsPassword: 'password',
    });

    // then
    const accountSettingsFromDb = await accountSettingsRepository.find();
    expect(accountSettingsFromDb.length).to.equal(1);
    expect(accountSettingsFromDb[0].clientId).to.equal(dbClient.id);
    expect(accountSettingsFromDb[0].fintsBlz).to.equal('12345678');
    expect(accountSettingsFromDb[0].fintsUrl).to.equal(
      'https://fints.bank.com',
    );
    expect(accountSettingsFromDb[0].fintsUser).to.equal('login');
    expect(accountSettingsFromDb[0].fintsPassword).to.equal('password');
  });

  it('should create accountSettings without fints params', async function() {
    // given
    const dbClient: Client = await clientRepository.create({
      name: 'Rentmonitor Test',
    });

    // when
    await accountSettingsRepository.create({
      clientId: dbClient.id,
    });

    // then
    const contractFromDb = await accountSettingsRepository.find();
    expect(contractFromDb.length).to.equal(1);
    expect(contractFromDb[0].clientId).to.equal(dbClient.id);
    expect(contractFromDb[0].fintsBlz).to.equal(null);
    expect(contractFromDb[0].fintsPassword).to.equal(null);
    expect(contractFromDb[0].fintsUrl).to.equal(null);
    expect(contractFromDb[0].fintsUser).to.equal(null);
  });
});

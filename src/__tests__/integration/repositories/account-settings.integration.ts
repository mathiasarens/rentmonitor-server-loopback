import {Getter, inject} from '@loopback/context';
import {
  BelongsToAccessor,
  DefaultCrudRepository,
  repository,
} from '@loopback/repository';
import {expect} from '@loopback/testlab';
import {RentmonitorDataSource} from '../../../datasources';
import {AccountSettings, Client} from '../../../models';
import {
  AccountSettingsRepository,
  ClientRepository,
} from '../../../repositories';
import {testdb} from '../../fixtures/datasources/rentmontior.datasource';
import {givenEmptyDatabase} from '../../helpers/database.helpers';

describe('Account Settings Repository Integration Tests', () => {
  let clientRepository: ClientRepository;
  let accountSettingsRepository: AccountSettingsRepository;
  let accountSettingsRepositoryInternal: AccountSettingsRepositoryInternal;

  beforeEach('setupApplication', async () => {
    await givenEmptyDatabase();

    clientRepository = new ClientRepository(testdb);
    const clientRepositoryGetter = Getter.fromValue(clientRepository);
    accountSettingsRepository = new AccountSettingsRepository(
      testdb,
      clientRepositoryGetter,
      'test_password',
    );
    accountSettingsRepositoryInternal = new AccountSettingsRepositoryInternal(
      testdb,
      clientRepositoryGetter,
    );
  });

  after(async () => {});

  it('should create empty accountSettings', async function() {
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
    const encryptedAccountSettingsFromDb = await accountSettingsRepositoryInternal.find();
    expect(encryptedAccountSettingsFromDb.length).to.equal(1);
    expect(encryptedAccountSettingsFromDb[0].clientId).to.equal(dbClient.id);
    expect(encryptedAccountSettingsFromDb[0].fintsBlz).to.equal(
      'de2ebd388e12e4fc4e74001a7b5cb309',
    );
    expect(encryptedAccountSettingsFromDb[0].fintsPassword).to.equal(
      '3c0f03113526e7bf2335d3e03ae05c31',
    );
    expect(encryptedAccountSettingsFromDb[0].fintsUrl).to.equal(
      'adfcad3fa1baedfe4ebec0287b20126ffe3d1c81dd19d6eb90158a8c9ab89940',
    );
    expect(encryptedAccountSettingsFromDb[0].fintsUser).to.equal(
      'b38c9ce5c926311c0e38828cf738d7ff',
    );

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

  it('should create empty accountSettings', async function() {
    // given
    const dbClient: Client = await clientRepository.create({
      name: 'Rentmonitor Test',
    });

    // when
    await accountSettingsRepository.create({
      clientId: dbClient.id,
    });

    // then
    const contractFromDb = await accountSettingsRepositoryInternal.find();
    expect(contractFromDb.length).to.equal(1);
    expect(contractFromDb[0].clientId).to.equal(dbClient.id);
    expect(contractFromDb[0].fintsBlz).to.equal(null);
    expect(contractFromDb[0].fintsPassword).to.equal(null);
    expect(contractFromDb[0].fintsUrl).to.equal(null);
    expect(contractFromDb[0].fintsUser).to.equal(null);
  });
});

class AccountSettingsRepositoryInternal extends DefaultCrudRepository<
  AccountSettings,
  typeof AccountSettings.prototype.id
> {
  public readonly client: BelongsToAccessor<
    Client,
    typeof AccountSettings.prototype.id
  >;

  constructor(
    @inject('datasources.rentmonitor') dataSource: RentmonitorDataSource,
    @repository.getter('ClientRepository')
    clientRepositoryGetter: Getter<ClientRepository>,
  ) {
    super(AccountSettings, dataSource);

    this.client = this.createBelongsToAccessorFor(
      'client',
      clientRepositoryGetter,
    );
  }
}

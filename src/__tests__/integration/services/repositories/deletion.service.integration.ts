import {Getter} from '@loopback/context';
import {expect} from '@loopback/testlab';
import {
  AccountSettings,
  AccountTransaction,
  AccountTransactionLog,
  Booking,
  Client,
  Contract,
  Tenant,
} from '../../../../models';
import {
  AccountSettingsRepository,
  AccountTransactionLogRepository,
  AccountTransactionRepository,
  BookingRepository,
  ClientRepository,
  ContractRepository,
  TenantRepository,
} from '../../../../repositories';
import {DeletionService} from '../../../../services/repositories/deletion.service';
import {testdb} from '../../../fixtures/datasources/rentmontior.datasource';
import {givenEmptyDatabase} from '../../../helpers/database.helpers';

describe('Deletion Service Integration', () => {
  let tenantRepository: TenantRepository;
  let contractRepository: ContractRepository;
  let clientRepository: ClientRepository;
  let bookingRepository: BookingRepository;
  let accountSettingsRepository: AccountSettingsRepository;
  let accountTransactionRepository: AccountTransactionRepository;
  let accountTransactionLogRepository: AccountTransactionLogRepository;
  let deletionService: DeletionService;
  let client1: Client;
  let client2: Client;
  let tenant11: Tenant;
  let tenant21: Tenant;
  let contract111: Contract;
  let contract211: Contract;
  let booking1111: Booking;
  let booking2111: Booking;
  let accountSettings11: AccountSettings;
  let accountSettings21: AccountSettings;
  let accountTransaction11: AccountTransaction;
  let accountTransaction21: AccountTransaction;
  let accountTransactionLog11: AccountTransactionLog;
  let accountTransactionLog21: AccountTransactionLog;

  beforeEach('setupApplication', async () => {
    await givenEmptyDatabase();

    clientRepository = new ClientRepository(testdb);
    const clientRepositoryGetter = Getter.fromValue(clientRepository);
    tenantRepository = new TenantRepository(testdb, clientRepositoryGetter);
    accountSettingsRepository = new AccountSettingsRepository(
      testdb,
      clientRepositoryGetter,
      'test_password',
      'test_salt',
    );
    accountTransactionLogRepository = new AccountTransactionLogRepository(
      testdb,
      clientRepositoryGetter,
    );
    const tenantRepositoryGetter = Getter.fromValue(tenantRepository);
    contractRepository = new ContractRepository(
      testdb,
      clientRepositoryGetter,
      tenantRepositoryGetter,
    );
    bookingRepository = new BookingRepository(
      testdb,
      clientRepositoryGetter,
      tenantRepositoryGetter,
      Getter.fromValue(contractRepository),
    );
    accountTransactionRepository = new AccountTransactionRepository(
      testdb,
      clientRepositoryGetter,
      Getter.fromValue(bookingRepository),
    );

    deletionService = new DeletionService(
      clientRepository,
      tenantRepository,
      contractRepository,
      bookingRepository,
      accountSettingsRepository,
      accountTransactionRepository,
      accountTransactionLogRepository,
    );

    client1 = await clientRepository.create({name: 'Client 1'});
    client2 = await clientRepository.create({name: 'Client 2'});
    tenant11 = await tenantRepository.create({
      clientId: client1.id,
      name: 'Client 1 - Teanant 1',
    });
    tenant21 = await tenantRepository.create({
      clientId: client2.id,
      name: 'Client 2 - Tenant 1',
    });
    contract111 = await contractRepository.create({
      clientId: client1.id,
      tenantId: tenant11.id,
    });
    contract211 = await contractRepository.create({
      clientId: client2.id,
      tenantId: tenant21.id,
    });
    booking1111 = await bookingRepository.create({
      clientId: client1.id,
      tenantId: tenant11.id,
      contractId: contract111.id,
      date: new Date(),
      amount: 1000,
    });
    booking2111 = await bookingRepository.create({
      clientId: client2.id,
      tenantId: tenant21.id,
      date: new Date(),
      amount: 1500,
    });

    accountSettings11 = await accountSettingsRepository.create({
      clientId: client1.id,
      fintsBlz: 'blz',
      fintsUrl: 'url',
    });
    accountSettings21 = await accountSettingsRepository.create({
      clientId: client2.id,
      fintsBlz: 'blz',
      fintsUrl: 'url',
    });

    accountTransaction11 = await accountTransactionRepository.create({
      clientId: client1.id,
      accountSettingsId: accountSettings11.id,
      date: new Date(),
    });
    accountTransaction21 = await accountTransactionRepository.create({
      clientId: client2.id,
      accountSettingsId: accountSettings21.id,
      date: new Date(),
    });

    accountTransactionLog11 = await accountTransactionLogRepository.create({
      clientId: client1.id,
      time: new Date(),
      rawstring: 'Test',
    });
    accountTransactionLog21 = await accountTransactionLogRepository.create({
      clientId: client2.id,
      time: new Date(),
      rawstring: 'Test',
    });
  });

  after(async () => {});

  it('should delete client 1', async function () {
    expect(await clientRepository.exists(client1.id)).to.be.true();
    expect(await clientRepository.exists(client2.id)).to.be.true();
    expect(await tenantRepository.exists(tenant11.id)).to.be.true();
    expect(await tenantRepository.exists(tenant21.id)).to.be.true();
    expect(await contractRepository.exists(contract111.id)).to.be.true();
    expect(await contractRepository.exists(contract211.id)).to.be.true();
    expect(await bookingRepository.exists(booking1111.id)).to.be.true();
    expect(await bookingRepository.exists(booking2111.id)).to.be.true();
    expect(
      await accountSettingsRepository.exists(accountSettings11.id),
    ).to.be.true();
    expect(
      await accountSettingsRepository.exists(accountSettings21.id),
    ).to.be.true();
    expect(
      await accountTransactionRepository.exists(accountTransaction11.id),
    ).to.be.true();
    expect(
      await accountTransactionRepository.exists(accountTransaction21.id),
    ).to.be.true();
    expect(
      await accountTransactionLogRepository.exists(accountTransactionLog11.id),
    ).to.be.true();
    expect(
      await accountTransactionLogRepository.exists(accountTransactionLog21.id),
    ).to.be.true();

    await deletionService.deleteClient(client1.id);

    expect(await clientRepository.exists(client1.id)).to.be.false();
    expect(await clientRepository.exists(client2.id)).to.be.true();
    expect(await tenantRepository.exists(tenant11.id)).to.be.false();
    expect(await tenantRepository.exists(tenant21.id)).to.be.true();
    expect(await contractRepository.exists(contract111.id)).to.be.false();
    expect(await contractRepository.exists(contract211.id)).to.be.true();
    expect(await bookingRepository.exists(booking1111.id)).to.be.false();
    expect(await bookingRepository.exists(booking2111.id)).to.be.true();
    expect(
      await accountSettingsRepository.exists(accountSettings11.id),
    ).to.be.false();
    expect(
      await accountSettingsRepository.exists(accountSettings21.id),
    ).to.be.true();
    expect(
      await accountTransactionRepository.exists(accountTransaction11.id),
    ).to.be.false();
    expect(
      await accountTransactionRepository.exists(accountTransaction21.id),
    ).to.be.true();
    expect(
      await accountTransactionLogRepository.exists(accountTransactionLog11.id),
    ).to.be.false();
    expect(
      await accountTransactionLogRepository.exists(accountTransactionLog21.id),
    ).to.be.true();
  });

  it('should delete all tables', async function () {
    expect(await clientRepository.find()).length(2);
    expect(await tenantRepository.find()).length(2);
    expect(await contractRepository.find()).length(2);
    expect(await bookingRepository.find()).length(2);
    expect(await accountSettingsRepository.find()).length(2);
    expect(await accountTransactionRepository.find()).length(2);
    expect(await accountTransactionLogRepository.find()).length(2);

    await deletionService.deleteAll();

    expect(await clientRepository.find()).length(0);
    expect(await tenantRepository.find()).length(0);
    expect(await contractRepository.find()).length(0);
    expect(await bookingRepository.find()).length(0);
    expect(await accountSettingsRepository.find()).length(0);
    expect(await accountTransactionRepository.find()).length(0);
    expect(await accountTransactionLogRepository.find()).length(0);
  });
});

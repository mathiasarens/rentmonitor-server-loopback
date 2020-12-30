import {Getter} from '@loopback/repository';
import {expect} from '@loopback/testlab';
import {AccountSettings, AccountTransaction} from '../../../../models';
import {
  AccountSettingsRepository,
  AccountTransactionRepository,
  BookingRepository,
  ClientRepository,
  ContractRepository,
  TenantRepository,
} from '../../../../repositories';
import {AccountSynchronisationBookingService} from '../../../../services/accountsynchronisation/account-synchronisation-booking.service';
import {AccountSynchronisationTransactionService} from '../../../../services/accountsynchronisation/account-synchronisation-transaction.service';
import {TransactionSynchronisationService} from '../../../../services/accountsynchronisation/transaction-synchronisation.service';
import {testdb} from '../../../fixtures/datasources/rentmontior.datasource';
import {givenEmptyDatabase} from '../../../helpers/database.helpers';

describe('Transaction Synchronisation Service Integration Tests', () => {
  let clientRepository: ClientRepository;
  let tenantRepository: TenantRepository;
  let contractRepository: ContractRepository;
  let bookingRepository: BookingRepository;
  let accountSettingsRepository: AccountSettingsRepository;
  let accountTransactionRepository: AccountTransactionRepository;
  let accountTransactionSaveService: AccountSynchronisationTransactionService;
  let transactionSynchronisationService: TransactionSynchronisationService;
  let accountSynchronisationBookingService: AccountSynchronisationBookingService;

  beforeEach('setup service and database', async () => {
    await givenEmptyDatabase();
    clientRepository = new ClientRepository(testdb);
    const clientRepositoryGetter = Getter.fromValue(clientRepository);
    tenantRepository = new TenantRepository(testdb, clientRepositoryGetter);
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

    accountSettingsRepository = new AccountSettingsRepository(
      testdb,
      clientRepositoryGetter,
      'password',
      'salt',
    );

    accountTransactionRepository = new AccountTransactionRepository(
      testdb,
      clientRepositoryGetter,
    );

    accountTransactionSaveService = new AccountSynchronisationTransactionService(
      accountTransactionRepository,
    );

    accountSynchronisationBookingService = new AccountSynchronisationBookingService(
      tenantRepository,
      bookingRepository,
    );

    transactionSynchronisationService = new TransactionSynchronisationService(
      accountTransactionRepository,
      accountSynchronisationBookingService,
    );
  });

  after(async () => {});

  it('should create new bookins from existing transactions', async function () {
    // given
    const client = await clientRepository.create({
      name: 'Client Transaction Sychronization Tests',
    });
    const accountSettings = await accountSettingsRepository.create(
      new AccountSettings({clientId: client.id}),
    );

    const unsavedAccountTransaction1 = new AccountTransaction({
      clientId: client.id,
      accountSettingsId: accountSettings.id,
      date: new Date(2019, 3, 14),
      iban: 'IBAN1',
      bic: 'BIC1',
      name: 'NAME1',
      text: 'text1',
      amount: 1000,
    });
    const savedAccountTransaction1 = await accountTransactionRepository.create(
      unsavedAccountTransaction1,
    );
    const accountTransactions = [savedAccountTransaction1];

    // when
    const newTransactionsList = await accountTransactionSaveService.saveNewAccountTransactions(
      accountSettings,
      accountTransactions,
    );

    // then
    const savedAccountTransactions: AccountTransaction[] = await accountTransactionRepository.find(
      {
        where: {clientId: client.id, accountSettingsId: accountSettings.id},
        order: ['date ASC'],
      },
    );
    expect(savedAccountTransactions).length(1);
    expect(newTransactionsList).length(1);
  });
});

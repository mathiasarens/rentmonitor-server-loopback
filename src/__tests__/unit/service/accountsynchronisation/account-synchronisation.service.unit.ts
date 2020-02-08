import {
  createStubInstance,
  sinon,
  StubbedInstanceWithSinonAccessor,
} from '@loopback/testlab';
import {SinonStubbedInstance} from 'sinon';
import {
  AccountSettings,
  AccountTransaction,
  AccountTransactionLog,
} from '../../../../models';
import {
  AccountSettingsRepository,
  AccountTransactionLogRepository,
} from '../../../../repositories';
import {AccountSynchronisationBookingService} from '../../../../services/accountsynchronisation/account-synchronisation-booking.service';
import {AccountSynchronisationTransactionService} from '../../../../services/accountsynchronisation/account-synchronisation-transaction.service';
import {AccountSynchronisationService} from '../../../../services/accountsynchronisation/account-synchronisation.service';
import {
  FinTsAccountTransactionDTO,
  FintsService,
} from '../../../../services/accountsynchronisation/fints.service';
import {FintsServiceImpl} from '../../../../services/accountsynchronisation/fints.service.impl';

describe('AccountSynchronisationService Unit Tests', () => {
  let accountTransactionService: AccountSynchronisationService;
  let accountSettingsRepositoryStub: StubbedInstanceWithSinonAccessor<AccountSettingsRepository>;
  let fintsAccountSynchronisationStub: SinonStubbedInstance<FintsService>;
  let accountTransactionLogRepositoryStub: StubbedInstanceWithSinonAccessor<AccountTransactionLogRepository>;
  let accountSynchronisationSaveServiceStub: SinonStubbedInstance<AccountSynchronisationTransactionService>;
  let accountSynchronisationBookingServiceStub: SinonStubbedInstance<AccountSynchronisationBookingService>;

  beforeEach('setup service and database', async () => {
    accountSettingsRepositoryStub = createStubInstance(
      AccountSettingsRepository,
    );
    accountTransactionLogRepositoryStub = createStubInstance(
      AccountTransactionLogRepository,
    );
    fintsAccountSynchronisationStub = sinon.createStubInstance(
      FintsServiceImpl,
    );
    accountSynchronisationSaveServiceStub = sinon.createStubInstance(
      AccountSynchronisationTransactionService,
    );
    accountSynchronisationBookingServiceStub = sinon.createStubInstance(
      AccountSynchronisationBookingService,
    );

    accountTransactionService = new AccountSynchronisationService(
      accountSettingsRepositoryStub,
      accountTransactionLogRepositoryStub,
      (fintsAccountSynchronisationStub as unknown) as FintsService,
      (accountSynchronisationSaveServiceStub as unknown) as AccountSynchronisationTransactionService,
      (accountSynchronisationBookingServiceStub as unknown) as AccountSynchronisationBookingService,
    );
  });

  after(async () => {});

  it('should synchronize fints transactions and create bookings', async function() {
    // given
    const clientId = 1;
    const accountSettingsId = 3234421;
    const accountSettings1 = new AccountSettings({
      id: accountSettingsId,
      clientId: clientId,
      fintsBlz: 'blz',
      fintsUrl: 'url',
      fintsUser: 'user',
      fintsPassword: 'password',
      rawAccount: 'serializedFintsAccount',
    });
    accountSettingsRepositoryStub.stubs.find.resolves([accountSettings1]);
    fintsAccountSynchronisationStub.fetchStatements.resolves([
      new FinTsAccountTransactionDTO(
        'rawstring1',
        new Date(2019, 3, 27),
        'Tenant1',
        'IBAN1',
        'BIC1',
        'Text1',
        1100,
      ),
    ]);

    const accountTransactions = [
      new AccountTransaction({
        clientId: clientId,
        accountSettingsId: accountSettingsId,
        amount: 1100,
        bic: 'BIC1',
        date: new Date(2019, 3, 27),
        iban: 'IBAN1',
        name: 'Tenant1',
        text: 'Text1',
      }),
    ];

    accountSynchronisationSaveServiceStub.saveNewAccountTransactions.resolves(
      accountTransactions,
    );

    const now = new Date(2019, 3, 11);
    // when
    await accountTransactionService.retrieveAndSaveNewAccountTransactionsAndCreateNewBookingsForAllAccounts(
      now,
      clientId,
    );

    // then
    sinon.assert.calledWithExactly(
      fintsAccountSynchronisationStub.fetchStatements,
      accountSettings1,
      undefined,
      undefined,
      undefined,
    );

    sinon.assert.calledWithExactly(
      accountTransactionLogRepositoryStub.stubs.createAll,
      [
        new AccountTransactionLog({
          clientId: clientId,
          accountSettingsId: accountSettingsId,
          rawstring: 'rawstring1',
          time: now,
        }),
      ],
    );

    sinon.assert.calledWithExactly(
      accountSynchronisationSaveServiceStub.saveNewAccountTransactions,
      accountSettings1,
      accountTransactions,
    );

    sinon.assert.calledWithExactly(
      accountSynchronisationBookingServiceStub.createAndSaveBookings,
      clientId,
      accountTransactions,
      now,
    );
  });
});

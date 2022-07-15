import {
  createStubInstance,
  expect,
  sinon,
  StubbedInstanceWithSinonAccessor,
} from '@loopback/testlab';
import {SinonStubbedInstance} from 'sinon';
import {AccountSettings, AccountTransaction} from '../../../../models';
import {AccountSettingsRepository} from '../../../../repositories';
import {AccountSynchronisationBookingService} from '../../../../services/accountsynchronisation/account-synchronisation-booking.service';
import {AccountSynchronisationTransactionService} from '../../../../services/accountsynchronisation/account-synchronisation-transaction.service';
import {
  AccountSynchronisationResult,
  AccountSynchronisationService,
} from '../../../../services/accountsynchronisation/account-synchronisation.service';
import {
  FinTsAccountTransactionDTO,
  FintsService,
} from '../../../../services/accountsynchronisation/fints.service';
import {FintsServiceImpl} from '../../../../services/accountsynchronisation/fints.service.impl';

describe('AccountSynchronisationService Unit Tests', () => {
  let accountTransactionService: AccountSynchronisationService;
  let accountSettingsRepositoryStub: StubbedInstanceWithSinonAccessor<AccountSettingsRepository>;
  let fintsAccountSynchronisationStub: SinonStubbedInstance<FintsService>;
  let accountSynchronisationSaveServiceStub: SinonStubbedInstance<AccountSynchronisationTransactionService>;
  let accountSynchronisationBookingServiceStub: SinonStubbedInstance<AccountSynchronisationBookingService>;

  beforeEach('setup service and database', async () => {
    accountSettingsRepositoryStub = createStubInstance(
      AccountSettingsRepository,
    );
    fintsAccountSynchronisationStub =
      sinon.createStubInstance(FintsServiceImpl);
    accountSynchronisationSaveServiceStub = sinon.createStubInstance(
      AccountSynchronisationTransactionService,
    );
    accountSynchronisationBookingServiceStub = sinon.createStubInstance(
      AccountSynchronisationBookingService,
    );

    accountTransactionService = new AccountSynchronisationService(
      accountSettingsRepositoryStub,
      fintsAccountSynchronisationStub as unknown as FintsService,
      accountSynchronisationSaveServiceStub as unknown as AccountSynchronisationTransactionService,
      accountSynchronisationBookingServiceStub as unknown as AccountSynchronisationBookingService,
    );
  });

  after(async () => {});

  it('should synchronize fints transactions and create bookings', async function () {
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
    accountSettingsRepositoryStub.stubs.findOne.resolves(accountSettings1);

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

    accountSynchronisationBookingServiceStub.createAndSaveNewBookings.resolves([
      [],
      [],
    ]);

    const now = new Date(2019, 3, 11);
    // when
    const result: AccountSynchronisationResult[] =
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
      accountSynchronisationSaveServiceStub.saveNewAccountTransactions,
      accountSettings1,
      accountTransactions,
    );

    sinon.assert.calledWithExactly(
      accountSynchronisationBookingServiceStub.createAndSaveNewBookings,
      clientId,
      accountTransactions,
      now,
    );

    expect(result.length).to.eql(1);
    expect(result[0].newBookings).to.eql([]);
    expect(result[0].unmatchedTransactions).to.eql([]);
  });
});

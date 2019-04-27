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
import {AccountSynchronisationSaveService} from '../../../../services/accountsynchronisation/account-synchronisation-save.service';
import {AccountSynchronisationService} from '../../../../services/accountsynchronisation/account-synchronisation.service';
import {
  FinTsAccountTransactionDTO,
  FintsAccountTransactionSynchronizationService,
} from '../../../../services/accountsynchronisation/fints.service';

describe('AccountSynchronisationService Unit Tests', () => {
  let accountTransactionService: AccountSynchronisationService;
  let accountSettingsRepositoryStub: StubbedInstanceWithSinonAccessor<
    AccountSettingsRepository
  >;
  let fintsAccountSynchronisationStub: SinonStubbedInstance<
    FintsAccountTransactionSynchronizationService
  >;
  let accountTransactionLogRepositoryStub: StubbedInstanceWithSinonAccessor<
    AccountTransactionLogRepository
  >;
  let accountTransactionSaveServiceStub: SinonStubbedInstance<
    AccountSynchronisationSaveService
  >;

  beforeEach('setup service and database', async () => {
    accountSettingsRepositoryStub = createStubInstance(
      AccountSettingsRepository,
    );
    accountTransactionLogRepositoryStub = createStubInstance(
      AccountTransactionLogRepository,
    );
    fintsAccountSynchronisationStub = sinon.createStubInstance(
      FintsAccountTransactionSynchronizationService,
    );
    accountTransactionSaveServiceStub = sinon.createStubInstance(
      AccountSynchronisationSaveService,
    );
    accountTransactionService = new AccountSynchronisationService(
      accountSettingsRepositoryStub,
      accountTransactionLogRepositoryStub,
      fintsAccountSynchronisationStub as any,
      accountTransactionSaveServiceStub as any,
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
    });
    accountSettingsRepositoryStub.stubs.find.resolves([accountSettings1]);
    fintsAccountSynchronisationStub.load.resolves([
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

    const now = new Date(2019, 3, 11);
    // when
    await accountTransactionService.retrieveAndSaveNewAccountTransactionsAndCreateNewBookings(
      now,
      clientId,
    );

    // then
    sinon.assert.calledWithExactly(
      fintsAccountSynchronisationStub.load,
      'blz',
      'url',
      'user',
      'password',
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
      accountTransactionSaveServiceStub.saveNewAccountTransactions,
      accountSettings1,
      [
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
      ],
    );
  });
});

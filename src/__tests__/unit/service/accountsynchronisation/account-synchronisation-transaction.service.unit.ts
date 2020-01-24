import { createStubInstance, sinon, StubbedInstanceWithSinonAccessor } from '@loopback/testlab';
import { AccountTransaction, AccountTransactionLog } from '../../../../models';
import { AccountTransactionRepository } from '../../../../repositories';
import { AccountSynchronisationTransactionService } from '../../../../services/accountsynchronisation/account-synchronisation-transaction.service';
import { FinTsAccountTransactionDTO } from '../../../../services/accountsynchronisation/fints.service';

describe('AccountSynchronisationTransactionService Unit Tests', () => {
  let accountSynchronisationTransactionService: AccountSynchronisationTransactionService;
  let accountTransactionRepositoryStub: StubbedInstanceWithSinonAccessor<AccountTransactionRepository>;

  beforeEach('setup service and database', async () => {
    accountTransactionRepositoryStub = createStubInstance(
      AccountTransactionRepository,
    );

    accountSynchronisationTransactionService = new AccountSynchronisationTransactionService(
      accountTransactionRepositoryStub
    );
  });

  after(async () => { });

  it('should save only new fints transactions', async function () {
    // given
    const clientId = 1;
    const accountSettingsId = 3234421;

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
    await accountSynchronisationTransactionService.saveNewAccountTransactions(
      now,
      clientId,
    );

    // then
    sinon.assert.calledWithExactly(
      fintsAccountSynchronisationStub.fetchStatements,
      'blz',
      'url',
      'user',
      'password',
      'serializedFintsAccount',
      undefined,
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

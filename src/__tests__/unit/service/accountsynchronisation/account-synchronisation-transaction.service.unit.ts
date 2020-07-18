import {
  createStubInstance,
  sinon,
  StubbedInstanceWithSinonAccessor,
} from '@loopback/testlab';
import {AccountSettings, AccountTransaction} from '../../../../models';
import {AccountTransactionRepository} from '../../../../repositories';
import {AccountSynchronisationTransactionService} from '../../../../services/accountsynchronisation/account-synchronisation-transaction.service';

describe('AccountSynchronisationTransactionService Unit Tests', () => {
  let accountSynchronisationTransactionService: AccountSynchronisationTransactionService;
  let accountTransactionRepositoryStub: StubbedInstanceWithSinonAccessor<AccountTransactionRepository>;

  beforeEach('setup service and database', async () => {
    accountTransactionRepositoryStub = createStubInstance(
      AccountTransactionRepository,
    );

    accountSynchronisationTransactionService = new AccountSynchronisationTransactionService(
      accountTransactionRepositoryStub,
    );
  });

  after(async () => {});

  it('should ignore single new account transaction if already saved in database', async function () {
    // given
    const clientId = 1;
    const accountSettingsId = 3234421;

    const existingAccountTransactions = [
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

    await runTest(
      accountSettingsId,
      clientId,
      existingAccountTransactions,
      [],
      accountTransactions,
    );
  });

  it('should add only new booking if new booking is newer than old booking and placed at the end of the list', async function () {
    // given
    const clientId = 1;
    const accountSettingsId = 3234421;

    const existingAccountTransaction1 = new AccountTransaction({
      clientId: clientId,
      accountSettingsId: accountSettingsId,
      amount: 1100,
      bic: 'BIC1',
      date: new Date(2019, 3, 27),
      iban: 'IBAN1',
      name: 'Tenant1',
      text: 'Text1',
    });

    const newAccountTransaction1 = new AccountTransaction({
      clientId: clientId,
      accountSettingsId: accountSettingsId,
      amount: 1100,
      bic: 'BIC1',
      date: new Date(2019, 3, 28),
      iban: 'IBAN1',
      name: 'Tenant1',
      text: 'Text1',
    });

    const existingAccountTransactions = [existingAccountTransaction1];

    const accountTransactions = [
      existingAccountTransaction1,
      newAccountTransaction1,
    ];

    await runTest(
      accountSettingsId,
      clientId,
      existingAccountTransactions,
      [newAccountTransaction1],
      accountTransactions,
    );
  });

  it('should add only new booking if new booking is between existing bookings and placed at the end of the list', async function () {
    // given
    const clientId = 1;
    const accountSettingsId = 3234421;

    const existingAccountTransaction1 = new AccountTransaction({
      clientId: clientId,
      accountSettingsId: accountSettingsId,
      amount: 1100,
      bic: 'BIC1',
      date: new Date(2019, 3, 27),
      iban: 'IBAN1',
      name: 'Tenant1',
      text: 'Text1',
    });

    const existingAccountTransaction2 = new AccountTransaction({
      clientId: clientId,
      accountSettingsId: accountSettingsId,
      amount: 1100,
      bic: 'BIC1',
      date: new Date(2019, 3, 29),
      iban: 'IBAN1',
      name: 'Tenant1',
      text: 'Text1',
    });

    const newAccountTransaction1 = new AccountTransaction({
      clientId: clientId,
      accountSettingsId: accountSettingsId,
      amount: 1100,
      bic: 'BIC1',
      date: new Date(2019, 3, 28),
      iban: 'IBAN1',
      name: 'Tenant1',
      text: 'Text1',
    });

    const existingAccountTransactions = [
      existingAccountTransaction2,
      existingAccountTransaction1,
    ];

    const accountTransactions = [
      existingAccountTransaction1,
      existingAccountTransaction2,
      newAccountTransaction1,
    ];

    await runTest(
      accountSettingsId,
      clientId,
      existingAccountTransactions,
      [newAccountTransaction1],
      accountTransactions,
    );
  });

  it('should add only new bookings if new bookings is between existing bookings and placed at the beginning of the list', async function () {
    // given
    const clientId = 1;
    const accountSettingsId = 3234421;

    const existingAccountTransaction1 = new AccountTransaction({
      clientId: clientId,
      accountSettingsId: accountSettingsId,
      amount: 1100,
      bic: 'BIC1',
      date: new Date(2019, 3, 27),
      iban: 'IBAN1',
      name: 'Tenant1',
      text: 'Text1',
    });

    const existingAccountTransaction2 = new AccountTransaction({
      clientId: clientId,
      accountSettingsId: accountSettingsId,
      amount: 1100,
      bic: 'BIC1',
      date: new Date(2019, 3, 29),
      iban: 'IBAN1',
      name: 'Tenant1',
      text: 'Text1',
    });

    const newAccountTransaction1 = new AccountTransaction({
      clientId: clientId,
      accountSettingsId: accountSettingsId,
      amount: 1100,
      bic: 'BIC1',
      date: new Date(2019, 3, 28),
      iban: 'IBAN1',
      name: 'Tenant1',
      text: 'Text1',
    });

    const existingAccountTransactions = [
      existingAccountTransaction1,
      existingAccountTransaction2,
    ];
    const accountTransactions = [
      newAccountTransaction1,
      existingAccountTransaction1,
      existingAccountTransaction2,
    ];
    await runTest(
      accountSettingsId,
      clientId,
      existingAccountTransactions,
      [newAccountTransaction1],
      accountTransactions,
    );
  });

  const runTest = async (
    accountSettingsId: number,
    clientId: number,
    existingAccountTransactions: AccountTransaction[],
    expectedAccountTransactions: AccountTransaction[],
    accountTransactions: AccountTransaction[],
  ) => {
    accountTransactionRepositoryStub.stubs.find.resolves(
      existingAccountTransactions,
    );

    const accountSettings1 = new AccountSettings({
      id: accountSettingsId,
      clientId: clientId,
      fintsBlz: 'blz',
      fintsUrl: 'url',
      fintsUser: 'user',
      fintsPassword: 'password',
      rawAccount: 'serializedFintsAccount',
    });

    // when
    await accountSynchronisationTransactionService.saveNewAccountTransactions(
      accountSettings1,
      accountTransactions,
    );

    // then
    sinon.assert.calledWithExactly(
      accountTransactionRepositoryStub.stubs.createAll,
      expectedAccountTransactions,
    );
  };
});

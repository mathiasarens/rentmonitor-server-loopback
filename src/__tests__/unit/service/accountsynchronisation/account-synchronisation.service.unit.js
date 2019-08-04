"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testlab_1 = require("@loopback/testlab");
const models_1 = require("../../../../models");
const repositories_1 = require("../../../../repositories");
const account_synchronisation_booking_service_1 = require("../../../../services/accountsynchronisation/account-synchronisation-booking.service");
const account_synchronisation_transaction_service_1 = require("../../../../services/accountsynchronisation/account-synchronisation-transaction.service");
const account_synchronisation_service_1 = require("../../../../services/accountsynchronisation/account-synchronisation.service");
const fints_service_1 = require("../../../../services/accountsynchronisation/fints.service");
describe('AccountSynchronisationService Unit Tests', () => {
    let accountTransactionService;
    let accountSettingsRepositoryStub;
    let fintsAccountSynchronisationStub;
    let accountTransactionLogRepositoryStub;
    let accountSynchronisationSaveServiceStub;
    let accountSynchronisationBookingServiceStub;
    beforeEach('setup service and database', async () => {
        accountSettingsRepositoryStub = testlab_1.createStubInstance(repositories_1.AccountSettingsRepository);
        accountTransactionLogRepositoryStub = testlab_1.createStubInstance(repositories_1.AccountTransactionLogRepository);
        fintsAccountSynchronisationStub = testlab_1.sinon.createStubInstance(fints_service_1.FintsAccountTransactionSynchronizationService);
        accountSynchronisationSaveServiceStub = testlab_1.sinon.createStubInstance(account_synchronisation_transaction_service_1.AccountSynchronisationSaveService);
        accountSynchronisationBookingServiceStub = testlab_1.sinon.createStubInstance(account_synchronisation_booking_service_1.AccountSynchronisationBookingService);
        accountTransactionService = new account_synchronisation_service_1.AccountSynchronisationService(accountSettingsRepositoryStub, accountTransactionLogRepositoryStub, fintsAccountSynchronisationStub, accountSynchronisationSaveServiceStub, accountSynchronisationBookingServiceStub);
    });
    after(async () => { });
    it('should synchronize fints transactions and create bookings', async function () {
        // given
        const clientId = 1;
        const accountSettingsId = 3234421;
        const accountSettings1 = new models_1.AccountSettings({
            id: accountSettingsId,
            clientId: clientId,
            fintsBlz: 'blz',
            fintsUrl: 'url',
            fintsUser: 'user',
            fintsPassword: 'password',
        });
        accountSettingsRepositoryStub.stubs.find.resolves([accountSettings1]);
        fintsAccountSynchronisationStub.load.resolves([
            new fints_service_1.FinTsAccountTransactionDTO('rawstring1', new Date(2019, 3, 27), 'Tenant1', 'IBAN1', 'BIC1', 'Text1', 1100),
        ]);
        const accountTransactions = [
            new models_1.AccountTransaction({
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
        accountSynchronisationSaveServiceStub.saveNewAccountTransactions.resolves(accountTransactions);
        const now = new Date(2019, 3, 11);
        // when
        await accountTransactionService.retrieveAndSaveNewAccountTransactionsAndCreateNewBookings(now, clientId);
        // then
        testlab_1.sinon.assert.calledWithExactly(fintsAccountSynchronisationStub.load, 'blz', 'url', 'user', 'password');
        testlab_1.sinon.assert.calledWithExactly(accountTransactionLogRepositoryStub.stubs.createAll, [
            new models_1.AccountTransactionLog({
                clientId: clientId,
                accountSettingsId: accountSettingsId,
                rawstring: 'rawstring1',
                time: now,
            }),
        ]);
        testlab_1.sinon.assert.calledWithExactly(accountSynchronisationSaveServiceStub.saveNewAccountTransactions, accountSettings1, accountTransactions);
        testlab_1.sinon.assert.calledWithExactly(accountSynchronisationBookingServiceStub.createAndSaveBookings, clientId, accountTransactions, now);
    });
});
//# sourceMappingURL=account-synchronisation.service.unit.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const repository_1 = require("@loopback/repository");
const testlab_1 = require("@loopback/testlab");
const models_1 = require("../../../../models");
const repositories_1 = require("../../../../repositories");
const account_synchronisation_transaction_service_1 = require("../../../../services/accountsynchronisation/account-synchronisation-transaction.service");
const rentmontior_datasource_1 = require("../../../fixtures/datasources/rentmontior.datasource");
const database_helpers_1 = require("../../../helpers/database.helpers");
describe('Account Synchronisation Transaction Service Integration Tests', () => {
    let clientRepository;
    let tenantRepository;
    let contractRepository;
    let bookingRepository;
    let accountTransactionRepository;
    let accountTransactionSaveService;
    beforeEach('setup service and database', async () => {
        await database_helpers_1.givenEmptyDatabase();
        clientRepository = new repositories_1.ClientRepository(rentmontior_datasource_1.testdb);
        const clientRepositoryGetter = repository_1.Getter.fromValue(clientRepository);
        tenantRepository = new repositories_1.TenantRepository(rentmontior_datasource_1.testdb, clientRepositoryGetter);
        const tenantRepositoryGetter = repository_1.Getter.fromValue(tenantRepository);
        contractRepository = new repositories_1.ContractRepository(rentmontior_datasource_1.testdb, clientRepositoryGetter, tenantRepositoryGetter);
        bookingRepository = new repositories_1.BookingRepository(rentmontior_datasource_1.testdb, clientRepositoryGetter, tenantRepositoryGetter, repository_1.Getter.fromValue(contractRepository));
        accountTransactionRepository = new repositories_1.AccountTransactionRepository(rentmontior_datasource_1.testdb, clientRepositoryGetter, repository_1.Getter.fromValue(bookingRepository));
        accountTransactionSaveService = new account_synchronisation_transaction_service_1.AccountSynchronisationSaveService(accountTransactionRepository);
    });
    after(async () => { });
    it('should save new transactions on an empty database', async function () {
        // given
        const accountSettings = new models_1.AccountSettings({ id: 1, clientId: 2 });
        const accountTransactions = [
            new models_1.AccountTransaction({
                clientId: 2,
                accountSettingsId: 1,
                date: new Date(2019, 3, 14),
                iban: 'IBAN1',
                bic: 'BIC1',
                name: 'NAME1',
                text: 'text1',
                amount: 1000,
            }),
        ];
        // when
        const newTransactionsList = await accountTransactionSaveService.saveNewAccountTransactions(accountSettings, accountTransactions);
        // then
        const savedAccountTransactions = await accountTransactionRepository.find({
            where: { clientId: 2, accountSettingsId: 1 },
            order: ['date ASC'],
        });
        testlab_1.expect(savedAccountTransactions).length(1);
        testlab_1.expect(newTransactionsList).length(1);
    });
    it('should save new transactions which are newer than an existing transaction', async function () {
        // given
        const accountSettings = new models_1.AccountSettings({ id: 1, clientId: 2 });
        const newAccountTransactions = [
            new models_1.AccountTransaction({
                clientId: 2,
                accountSettingsId: 1,
                date: new Date(2019, 3, 13),
                iban: 'IBAN1',
                bic: 'BIC1',
                name: 'NAME1',
                text: 'text1',
                amount: 1000,
            }),
            new models_1.AccountTransaction({
                clientId: 2,
                accountSettingsId: 1,
                date: new Date(2019, 3, 14),
                iban: 'IBAN1',
                bic: 'BIC1',
                name: 'NAME1',
                text: 'text1',
                amount: 500,
            }),
        ];
        await accountTransactionRepository.create({
            clientId: 2,
            accountSettingsId: 1,
            date: new Date(2018, 0, 1),
            iban: 'IBAN1',
            bic: 'BIC1',
            name: 'NAME1',
            text: 'text1',
            amount: 500,
        });
        // when
        const newTransactionsList = await accountTransactionSaveService.saveNewAccountTransactions(accountSettings, newAccountTransactions);
        // then
        const savedAccountTransactions = await accountTransactionRepository.find({
            where: { clientId: 2, accountSettingsId: 1 },
            order: ['date ASC'],
        });
        testlab_1.expect(savedAccountTransactions).length(3);
        testlab_1.expect(newTransactionsList).length(2);
    });
    it('should save new transactions which are almost equal to an existing transaction except for one field', async function () {
        // given
        const accountSettings = new models_1.AccountSettings({ id: 1, clientId: 2 });
        const newAccountTransactions = [
            new models_1.AccountTransaction({
                clientId: 2,
                accountSettingsId: 1,
                date: new Date(2019, 3, 14),
                iban: 'IBAN',
                bic: 'BIC',
                name: 'NAME',
                text: 'text',
                amount: 1000,
            }),
            new models_1.AccountTransaction({
                clientId: 2,
                accountSettingsId: 1,
                date: new Date(2019, 3, 13),
                iban: 'DIFFRENT-IBAN',
                bic: 'BIC',
                name: 'NAME',
                text: 'text',
                amount: 1000,
            }),
            new models_1.AccountTransaction({
                clientId: 2,
                accountSettingsId: 1,
                date: new Date(2019, 3, 13),
                iban: 'IBAN',
                bic: 'DIFFRENT-BIC',
                name: 'NAME',
                text: 'text',
                amount: 1000,
            }),
            new models_1.AccountTransaction({
                clientId: 2,
                accountSettingsId: 1,
                date: new Date(2019, 3, 13),
                iban: 'IBAN',
                bic: 'BIC',
                name: 'DIFFRENT-NAME',
                text: 'text',
                amount: 1000,
            }),
            new models_1.AccountTransaction({
                clientId: 2,
                accountSettingsId: 1,
                date: new Date(2019, 3, 13),
                iban: 'IBAN',
                bic: 'BIC',
                name: 'NAME',
                text: 'DIFFRENT-text',
                amount: 1000,
            }),
            new models_1.AccountTransaction({
                clientId: 2,
                accountSettingsId: 1,
                date: new Date(2019, 3, 13),
                iban: 'IBAN',
                bic: 'BIC',
                name: 'NAME',
                text: 'text',
                amount: 2000,
            }),
        ];
        await accountTransactionRepository.create({
            clientId: 2,
            accountSettingsId: 1,
            date: new Date(2018, 3, 13),
            iban: 'IBAN',
            bic: 'BIC',
            name: 'NAME',
            text: 'text',
            amount: 1000,
        });
        // when
        const newTransactionsList = await accountTransactionSaveService.saveNewAccountTransactions(accountSettings, newAccountTransactions);
        // then
        const savedAccountTransactions = await accountTransactionRepository.find({
            where: { clientId: 2, accountSettingsId: 1 },
            order: ['date ASC'],
        });
        testlab_1.expect(savedAccountTransactions).length(7);
        testlab_1.expect(newTransactionsList).length(6);
    });
    it('should save 2 new transactions but not override an duplicate one', async function () {
        // given
        const accountSettings = new models_1.AccountSettings({ id: 1, clientId: 2 });
        const newAccountTransactions = [
            new models_1.AccountTransaction({
                clientId: 2,
                accountSettingsId: 1,
                date: new Date(2019, 3, 13),
                iban: 'IBAN',
                bic: 'BIC',
                name: 'NAME',
                text: 'text',
                amount: 1000,
            }),
            new models_1.AccountTransaction({
                clientId: 2,
                accountSettingsId: 1,
                date: new Date(2019, 3, 13),
                iban: 'IBAN',
                bic: 'BIC',
                name: 'NAME',
                text: 'text',
                amount: 1000,
            }),
            new models_1.AccountTransaction({
                clientId: 2,
                accountSettingsId: 1,
                date: new Date(2019, 3, 13),
                iban: 'IBAN',
                bic: 'BIC',
                name: 'NAME',
                text: 'text',
                amount: 1000,
            }),
        ];
        await accountTransactionRepository.create({
            clientId: 2,
            accountSettingsId: 1,
            date: new Date(2019, 3, 13),
            iban: 'IBAN',
            bic: 'BIC',
            name: 'NAME',
            text: 'text',
            amount: 1000,
        });
        // when
        const newTransactionsList = await accountTransactionSaveService.saveNewAccountTransactions(accountSettings, newAccountTransactions);
        // then
        const savedAccountTransactions = await accountTransactionRepository.find({
            where: { clientId: 2, accountSettingsId: 1 },
            order: ['date ASC'],
        });
        testlab_1.expect(savedAccountTransactions).length(3);
        testlab_1.expect(newTransactionsList).length(2);
    });
    it('should save a new transactions but not override two duplicates', async function () {
        // given
        const accountSettings = new models_1.AccountSettings({ id: 1, clientId: 2 });
        const newAccountTransactions = [
            new models_1.AccountTransaction({
                clientId: 2,
                accountSettingsId: 1,
                date: new Date(2019, 3, 13),
                iban: 'IBAN',
                bic: 'BIC',
                name: 'NAME',
                text: 'text',
                amount: 1000,
            }),
            new models_1.AccountTransaction({
                clientId: 2,
                accountSettingsId: 1,
                date: new Date(2019, 3, 13),
                iban: 'IBAN',
                bic: 'BIC',
                name: 'NAME',
                text: 'text',
                amount: 1000,
            }),
            new models_1.AccountTransaction({
                clientId: 2,
                accountSettingsId: 1,
                date: new Date(2019, 3, 13),
                iban: 'IBAN',
                bic: 'BIC',
                name: 'NAME',
                text: 'text',
                amount: 1000,
            }),
        ];
        await accountTransactionRepository.create({
            clientId: 2,
            accountSettingsId: 1,
            date: new Date(2019, 3, 13),
            iban: 'IBAN',
            bic: 'BIC',
            name: 'NAME',
            text: 'text',
            amount: 1000,
        });
        await accountTransactionRepository.create({
            clientId: 2,
            accountSettingsId: 1,
            date: new Date(2019, 3, 13),
            iban: 'IBAN',
            bic: 'BIC',
            name: 'NAME',
            text: 'text',
            amount: 1000,
        });
        // when
        const newTransactionsList = await accountTransactionSaveService.saveNewAccountTransactions(accountSettings, newAccountTransactions);
        // then
        const savedAccountTransactions = await accountTransactionRepository.find({
            where: { clientId: 2, accountSettingsId: 1 },
            order: ['date ASC'],
        });
        testlab_1.expect(savedAccountTransactions).length(3);
        testlab_1.expect(newTransactionsList).length(1);
    });
    it('should save new duplicate transactions in empty database', async function () {
        // given
        const accountSettings = new models_1.AccountSettings({ id: 1, clientId: 2 });
        const newAccountTransactions = [
            new models_1.AccountTransaction({
                clientId: 2,
                accountSettingsId: 1,
                date: new Date(2019, 3, 13),
                iban: 'IBAN',
                bic: 'BIC',
                name: 'NAME',
                text: 'text',
                amount: 1000,
            }),
            new models_1.AccountTransaction({
                clientId: 2,
                accountSettingsId: 1,
                date: new Date(2019, 3, 13),
                iban: 'IBAN',
                bic: 'BIC',
                name: 'NAME',
                text: 'text',
                amount: 1000,
            }),
            new models_1.AccountTransaction({
                clientId: 2,
                accountSettingsId: 1,
                date: new Date(2019, 3, 13),
                iban: 'IBAN',
                bic: 'BIC',
                name: 'NAME',
                text: 'text',
                amount: 1000,
            }),
        ];
        // when
        const newTransactionsList = await accountTransactionSaveService.saveNewAccountTransactions(accountSettings, newAccountTransactions);
        // then
        const savedAccountTransactions = await accountTransactionRepository.find({
            where: { clientId: 2, accountSettingsId: 1 },
            order: ['date ASC'],
        });
        testlab_1.expect(savedAccountTransactions).length(3);
        testlab_1.expect(newTransactionsList).length(3);
    });
    it('should save new transactions if new transactions are inbetween old transactions', async function () {
        // given
        const accountSettings = new models_1.AccountSettings({ id: 1, clientId: 2 });
        const newAccountTransactions = [
            new models_1.AccountTransaction({
                clientId: 2,
                accountSettingsId: 1,
                date: new Date(2019, 3, 1),
                iban: 'IBAN',
                bic: 'BIC',
                name: 'NAME',
                text: 'text',
                amount: 1000,
            }),
            new models_1.AccountTransaction({
                clientId: 2,
                accountSettingsId: 1,
                date: new Date(2019, 3, 3),
                iban: 'IBAN',
                bic: 'BIC',
                name: 'NAME',
                text: 'text',
                amount: 1000,
            }),
            new models_1.AccountTransaction({
                clientId: 2,
                accountSettingsId: 1,
                date: new Date(2019, 3, 5),
                iban: 'IBAN',
                bic: 'BIC',
                name: 'NAME',
                text: 'text',
                amount: 1000,
            }),
        ];
        await accountTransactionRepository.create({
            clientId: 2,
            accountSettingsId: 1,
            date: new Date(2018, 3, 2),
            iban: 'IBAN',
            bic: 'BIC',
            name: 'NAME',
            text: 'text',
            amount: 1000,
        });
        await accountTransactionRepository.create({
            clientId: 2,
            accountSettingsId: 1,
            date: new Date(2018, 3, 4),
            iban: 'IBAN',
            bic: 'BIC',
            name: 'NAME',
            text: 'text',
            amount: 1000,
        });
        // when
        const newTransactionsList = await accountTransactionSaveService.saveNewAccountTransactions(accountSettings, newAccountTransactions);
        // then
        const savedAccountTransactions = await accountTransactionRepository.find({
            where: { clientId: 2, accountSettingsId: 1 },
            order: ['date ASC'],
        });
        testlab_1.expect(savedAccountTransactions).length(5);
        testlab_1.expect(newTransactionsList).length(3);
    });
});
//# sourceMappingURL=account-synchronisation-transaction.integration.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const repository_1 = require("@loopback/repository");
const testlab_1 = require("@loopback/testlab");
const models_1 = require("../../../../models");
const repositories_1 = require("../../../../repositories");
const account_synchronisation_booking_service_1 = require("../../../../services/accountsynchronisation/account-synchronisation-booking.service");
const rentmontior_datasource_1 = require("../../../fixtures/datasources/rentmontior.datasource");
const database_helpers_1 = require("../../../helpers/database.helpers");
describe('Account Synchronisation Booking Integration Tests', () => {
    let clientRepository;
    let tenantRepository;
    let contractRepository;
    let bookingRepository;
    let accountTransactionRepository;
    let accountSynchronisationBookingService;
    let client1;
    let tenant1;
    beforeEach('setup service and database', async () => {
        await database_helpers_1.givenEmptyDatabase();
        clientRepository = new repositories_1.ClientRepository(rentmontior_datasource_1.testdb);
        const clientRepositoryGetter = repository_1.Getter.fromValue(clientRepository);
        tenantRepository = new repositories_1.TenantRepository(rentmontior_datasource_1.testdb, clientRepositoryGetter);
        const tenantRepositoryGetter = repository_1.Getter.fromValue(tenantRepository);
        contractRepository = new repositories_1.ContractRepository(rentmontior_datasource_1.testdb, clientRepositoryGetter, tenantRepositoryGetter);
        bookingRepository = new repositories_1.BookingRepository(rentmontior_datasource_1.testdb, clientRepositoryGetter, tenantRepositoryGetter, repository_1.Getter.fromValue(contractRepository));
        accountTransactionRepository = new repositories_1.AccountTransactionRepository(rentmontior_datasource_1.testdb, clientRepositoryGetter, repository_1.Getter.fromValue(bookingRepository));
        accountSynchronisationBookingService = new account_synchronisation_booking_service_1.AccountSynchronisationBookingService(contractRepository, bookingRepository, accountTransactionRepository);
        client1 = await clientRepository.create({ name: 'Client1' });
        tenant1 = await tenantRepository.create({ name: 'Tenant1' });
    });
    after(async () => { });
    it('should save new bookings if contract active', async function () {
        // given
        const accountSettings = new models_1.AccountSettings({ id: 1, clientId: client1.id });
        const accountTransaction1 = await accountTransactionRepository.create({
            clientId: client1.id,
            accountSettingsId: accountSettings.id,
            date: new Date(2019, 3, 14),
            iban: 'IBAN1',
            bic: 'BIC1',
            name: 'Tenant1 Account Name',
            text: 'text1',
            amount: 1000,
        });
        const contract1 = await contractRepository.create({
            clientId: client1.id,
            tenantId: tenant1.id,
            start: new Date(2018, 0, 1),
            amount: 5000,
            accountSynchronisationName: 'Tenant1 Account Name',
        });
        const accountTransactions = [accountTransaction1];
        // when
        const result = await accountSynchronisationBookingService.createAndSaveBookings(client1.id, accountTransactions, new Date(2019, 0, 1));
        // then
        testlab_1.expect(result[0]).length(1);
        testlab_1.expect(result[1]).length(0);
        testlab_1.expect(result[0][0].accountTransactionId).to.eql(accountTransaction1.id);
        // booking
        const bookings = await bookingRepository.find({
            where: { clientId: client1.id },
        });
        testlab_1.expect(bookings).length(1);
        testlab_1.expect(bookings[0].clientId).to.eql(client1.id);
        testlab_1.expect(bookings[0].tenantId).to.eql(tenant1.id);
        testlab_1.expect(bookings[0].contractId).to.eql(contract1.id);
        testlab_1.expect(bookings[0].accountTransactionId).to.eql(accountTransaction1.id);
        testlab_1.expect(bookings[0].date).to.eql(accountTransaction1.date);
        testlab_1.expect(bookings[0].comment).to.eql(accountTransaction1.text);
        testlab_1.expect(bookings[0].amount).to.eql(accountTransaction1.amount);
        testlab_1.expect(bookings[0].type).to.eql(models_1.BookingType.RENT_DUE);
        // updated account transaction
        const savedAccountTransactions = await accountTransactionRepository.find({
            where: { clientId: client1.id, accountSettingsId: accountSettings.id },
            order: ['date ASC'],
        });
        testlab_1.expect(savedAccountTransactions).length(1);
        testlab_1.expect(savedAccountTransactions[0].bookingId).to.eql(result[0][0].id);
    });
    it('should not save new booking if contract is inactive', async function () {
        // given
        const accountSettings = new models_1.AccountSettings({ id: 1, clientId: client1.id });
        const accountTransaction1 = await accountTransactionRepository.create({
            clientId: client1.id,
            accountSettingsId: accountSettings.id,
            date: new Date(2019, 3, 14),
            iban: 'IBAN1',
            bic: 'BIC1',
            name: 'Tenant1 Account Name',
            text: 'text1',
            amount: 1000,
        });
        await contractRepository.create({
            clientId: client1.id,
            tenantId: tenant1.id,
            start: new Date(2018, 0, 1),
            end: new Date(2018, 11, 31),
            amount: 5000,
            accountSynchronisationName: 'Tenant1 Account Name',
        });
        const accountTransactions = [accountTransaction1];
        // when
        const result = await accountSynchronisationBookingService.createAndSaveBookings(client1.id, accountTransactions, new Date(2019, 0, 1));
        // then
        testlab_1.expect(result[0]).length(0);
        testlab_1.expect(result[1]).length(1);
        testlab_1.expect(result[1][0].bookingId).to.eql(undefined);
        // booking
        const bookings = await bookingRepository.find({
            where: { clientId: client1.id },
        });
        testlab_1.expect(bookings).length(0);
        // updated account transaction
        const savedAccountTransactions = await accountTransactionRepository.find({
            where: { clientId: client1.id, accountSettingsId: accountSettings.id },
            order: ['date ASC'],
        });
        testlab_1.expect(savedAccountTransactions).length(1);
        testlab_1.expect(savedAccountTransactions[0].bookingId).to.eql(null);
    });
});
//# sourceMappingURL=account-synchronisation-booking.integration.js.map
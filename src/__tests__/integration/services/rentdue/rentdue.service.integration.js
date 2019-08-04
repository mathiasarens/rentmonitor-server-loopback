"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const context_1 = require("@loopback/context");
const testlab_1 = require("@loopback/testlab");
const models_1 = require("../../../../models");
const repositories_1 = require("../../../../repositories");
const rentdue_calculation_service_1 = require("../../../../services/rentdue/rentdue.calculation.service");
const rentdue_service_1 = require("../../../../services/rentdue/rentdue.service");
const rentmontior_datasource_1 = require("../../../fixtures/datasources/rentmontior.datasource");
const database_helpers_1 = require("../../../helpers/database.helpers");
describe('RentDue Service Integration Tests', () => {
    let tenantRepository;
    let contractRepository;
    let clientRepository;
    let bookingRepository;
    let rentDueService;
    let client;
    let tenant;
    let contract;
    beforeEach('setup service and database', async () => {
        await database_helpers_1.givenEmptyDatabase();
        clientRepository = new repositories_1.ClientRepository(rentmontior_datasource_1.testdb);
        const clientRepositoryGetter = context_1.Getter.fromValue(clientRepository);
        tenantRepository = new repositories_1.TenantRepository(rentmontior_datasource_1.testdb, clientRepositoryGetter);
        const tenantRepositoryGetter = context_1.Getter.fromValue(tenantRepository);
        contractRepository = new repositories_1.ContractRepository(rentmontior_datasource_1.testdb, clientRepositoryGetter, tenantRepositoryGetter);
        const contractRepositoryGetter = context_1.Getter.fromValue(contractRepository);
        bookingRepository = new repositories_1.BookingRepository(rentmontior_datasource_1.testdb, clientRepositoryGetter, tenantRepositoryGetter, contractRepositoryGetter);
        client = await clientRepository.create({ name: 'Test Client' });
        tenant = await tenantRepository.create({
            clientId: client.id,
            name: 'Test Debitor',
        });
        contract = await contractRepository.create({
            clientId: client.id,
            tenantId: tenant.id,
            start: new Date(2019, 1, 10),
            rentDueEveryMonth: 1,
            rentDueDayOfMonth: 10,
            amount: 1000,
        });
        rentDueService = new rentdue_service_1.RentDueService(tenantRepository, contractRepository, bookingRepository, new rentdue_calculation_service_1.RentDueCalculationService());
    });
    after(async () => { });
    it('should create due booking for current month', async function () {
        // given
        await bookingRepository.create({
            clientId: client.id,
            tenantId: tenant.id,
            contractId: contract.id,
            date: new Date(2019, 1, 10),
            comment: 'Rent 02/2019',
            amount: -900,
            type: models_1.BookingType.RENT_DUE,
        });
        await bookingRepository.create({
            clientId: client.id,
            tenantId: tenant.id,
            contractId: contract.id,
            date: new Date(2019, 2, 10),
            comment: 'Rent 03/2019',
            amount: -1000,
            type: models_1.BookingType.RENT_DUE,
        });
        // when
        await rentDueService.calculateRentDueAndSaveResultsToDatabase(client.id, new Date(2019, 3, 15));
        // then
        const newBooking = await bookingRepository.findOne({
            where: { clientId: client.id },
            order: ['date DESC'],
            limit: 1,
        });
        testlab_1.expect(newBooking.clientId).to.eql(client.id);
        testlab_1.expect(newBooking.tenantId).to.eql(tenant.id);
        testlab_1.expect(newBooking.contractId).to.eql(contract.id);
        testlab_1.expect(newBooking.date).to.eql(new Date(2019, 3, 10));
        testlab_1.expect(newBooking.comment).to.eql('Rent');
        testlab_1.expect(newBooking.amount).to.eql(-1000);
        testlab_1.expect(newBooking.type).to.eql(models_1.BookingType.RENT_DUE);
    });
});
//# sourceMappingURL=rentdue.service.integration.js.map
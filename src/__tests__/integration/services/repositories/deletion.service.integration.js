"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const context_1 = require("@loopback/context");
const testlab_1 = require("@loopback/testlab");
const repositories_1 = require("../../../../repositories");
const deletion_service_1 = require("../../../../services/repositories/deletion.service");
const rentmontior_datasource_1 = require("../../../fixtures/datasources/rentmontior.datasource");
const database_helpers_1 = require("../../../helpers/database.helpers");
describe('Deletion Service Integration', () => {
    let tenantRepository;
    let contractRepository;
    let clientRepository;
    let bookingRepository;
    let accountSettingsRepository;
    let accountTransactionRepository;
    let accountTransactionLogRepository;
    let deletionService;
    let client1;
    let client2;
    let tenant11;
    let tenant21;
    let contract111;
    let contract211;
    let booking1111;
    let booking2111;
    let accountSettings11;
    let accountSettings21;
    let accountTransaction11;
    let accountTransaction21;
    let accountTransactionLog11;
    let accountTransactionLog21;
    beforeEach('setupApplication', async () => {
        await database_helpers_1.givenEmptyDatabase();
        clientRepository = new repositories_1.ClientRepository(rentmontior_datasource_1.testdb);
        const clientRepositoryGetter = context_1.Getter.fromValue(clientRepository);
        tenantRepository = new repositories_1.TenantRepository(rentmontior_datasource_1.testdb, clientRepositoryGetter);
        accountSettingsRepository = new repositories_1.AccountSettingsRepository(rentmontior_datasource_1.testdb, clientRepositoryGetter, 'test_password');
        accountTransactionLogRepository = new repositories_1.AccountTransactionLogRepository(rentmontior_datasource_1.testdb, clientRepositoryGetter);
        const tenantRepositoryGetter = context_1.Getter.fromValue(tenantRepository);
        contractRepository = new repositories_1.ContractRepository(rentmontior_datasource_1.testdb, clientRepositoryGetter, tenantRepositoryGetter);
        bookingRepository = new repositories_1.BookingRepository(rentmontior_datasource_1.testdb, clientRepositoryGetter, tenantRepositoryGetter, context_1.Getter.fromValue(contractRepository));
        accountTransactionRepository = new repositories_1.AccountTransactionRepository(rentmontior_datasource_1.testdb, clientRepositoryGetter, context_1.Getter.fromValue(bookingRepository));
        deletionService = new deletion_service_1.DeletionService(clientRepository, tenantRepository, contractRepository, bookingRepository, accountSettingsRepository, accountTransactionRepository, accountTransactionLogRepository);
        client1 = await clientRepository.create({ name: 'Client 1' });
        client2 = await clientRepository.create({ name: 'Client 2' });
        tenant11 = await tenantRepository.create({
            clientId: client1.id,
            name: 'Client 1 - Teanant 1',
        });
        tenant21 = await tenantRepository.create({
            clientId: client2.id,
            name: 'Client 2 - Tenant 1',
        });
        contract111 = await contractRepository.create({
            clientId: client1.id,
            tenantId: tenant11.id,
        });
        contract211 = await contractRepository.create({
            clientId: client2.id,
            tenantId: tenant21.id,
        });
        booking1111 = await bookingRepository.create({
            clientId: client1.id,
            tenantId: tenant11.id,
            contractId: contract111.id,
            date: new Date(),
        });
        booking2111 = await bookingRepository.create({
            clientId: client2.id,
            tenantId: tenant21.id,
            date: new Date(),
        });
        accountSettings11 = await accountSettingsRepository.create({
            clientId: client1.id,
            fintsBlz: 'blz',
            fintsUrl: 'url',
        });
        accountSettings21 = await accountSettingsRepository.create({
            clientId: client2.id,
            fintsBlz: 'blz',
            fintsUrl: 'url',
        });
        accountTransaction11 = await accountTransactionRepository.create({
            clientId: client1.id,
            accountSettingsId: accountSettings11.id,
            date: new Date(),
        });
        accountTransaction21 = await accountTransactionRepository.create({
            clientId: client2.id,
            accountSettingsId: accountSettings21.id,
            date: new Date(),
        });
        accountTransactionLog11 = await accountTransactionLogRepository.create({
            clientId: client1.id,
            time: new Date(),
            rawstring: 'Test',
        });
        accountTransactionLog21 = await accountTransactionLogRepository.create({
            clientId: client2.id,
            time: new Date(),
            rawstring: 'Test',
        });
    });
    after(async () => { });
    it('should delete client 1', async function () {
        testlab_1.expect(await clientRepository.exists(client1.id)).to.be.true();
        testlab_1.expect(await clientRepository.exists(client2.id)).to.be.true();
        testlab_1.expect(await tenantRepository.exists(tenant11.id)).to.be.true();
        testlab_1.expect(await tenantRepository.exists(tenant21.id)).to.be.true();
        testlab_1.expect(await contractRepository.exists(contract111.id)).to.be.true();
        testlab_1.expect(await contractRepository.exists(contract211.id)).to.be.true();
        testlab_1.expect(await bookingRepository.exists(booking1111.id)).to.be.true();
        testlab_1.expect(await bookingRepository.exists(booking2111.id)).to.be.true();
        testlab_1.expect(await accountSettingsRepository.exists(accountSettings11.id)).to.be.true();
        testlab_1.expect(await accountSettingsRepository.exists(accountSettings21.id)).to.be.true();
        testlab_1.expect(await accountTransactionRepository.exists(accountTransaction11.id)).to.be.true();
        testlab_1.expect(await accountTransactionRepository.exists(accountTransaction21.id)).to.be.true();
        testlab_1.expect(await accountTransactionLogRepository.exists(accountTransactionLog11.id)).to.be.true();
        testlab_1.expect(await accountTransactionLogRepository.exists(accountTransactionLog21.id)).to.be.true();
        await deletionService.deleteClient(client1.id);
        testlab_1.expect(await clientRepository.exists(client1.id)).to.be.false();
        testlab_1.expect(await clientRepository.exists(client2.id)).to.be.true();
        testlab_1.expect(await tenantRepository.exists(tenant11.id)).to.be.false();
        testlab_1.expect(await tenantRepository.exists(tenant21.id)).to.be.true();
        testlab_1.expect(await contractRepository.exists(contract111.id)).to.be.false();
        testlab_1.expect(await contractRepository.exists(contract211.id)).to.be.true();
        testlab_1.expect(await bookingRepository.exists(booking1111.id)).to.be.false();
        testlab_1.expect(await bookingRepository.exists(booking2111.id)).to.be.true();
        testlab_1.expect(await accountSettingsRepository.exists(accountSettings11.id)).to.be.false();
        testlab_1.expect(await accountSettingsRepository.exists(accountSettings21.id)).to.be.true();
        testlab_1.expect(await accountTransactionRepository.exists(accountTransaction11.id)).to.be.false();
        testlab_1.expect(await accountTransactionRepository.exists(accountTransaction21.id)).to.be.true();
        testlab_1.expect(await accountTransactionLogRepository.exists(accountTransactionLog11.id)).to.be.false();
        testlab_1.expect(await accountTransactionLogRepository.exists(accountTransactionLog21.id)).to.be.true();
    });
    it('should delete all tables', async function () {
        testlab_1.expect(await clientRepository.find()).length(2);
        testlab_1.expect(await tenantRepository.find()).length(2);
        testlab_1.expect(await contractRepository.find()).length(2);
        testlab_1.expect(await bookingRepository.find()).length(2);
        testlab_1.expect(await accountSettingsRepository.find()).length(2);
        testlab_1.expect(await accountTransactionRepository.find()).length(2);
        testlab_1.expect(await accountTransactionLogRepository.find()).length(2);
        await deletionService.deleteAll();
        testlab_1.expect(await clientRepository.find()).length(0);
        testlab_1.expect(await tenantRepository.find()).length(0);
        testlab_1.expect(await contractRepository.find()).length(0);
        testlab_1.expect(await bookingRepository.find()).length(0);
        testlab_1.expect(await accountSettingsRepository.find()).length(0);
        testlab_1.expect(await accountTransactionRepository.find()).length(0);
        testlab_1.expect(await accountTransactionLogRepository.find()).length(0);
    });
});
//# sourceMappingURL=deletion.service.integration.js.map
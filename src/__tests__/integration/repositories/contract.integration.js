"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const context_1 = require("@loopback/context");
const testlab_1 = require("@loopback/testlab");
const repositories_1 = require("../../../repositories");
const rentmontior_datasource_1 = require("../../fixtures/datasources/rentmontior.datasource");
const database_helpers_1 = require("../../helpers/database.helpers");
describe('Contract Repository Integration Tests', () => {
    let contractRepository;
    before('setupApplication', async () => {
        await database_helpers_1.givenEmptyDatabase();
        const clientRepositoryGetter = context_1.Getter.fromValue(new repositories_1.ClientRepository(rentmontior_datasource_1.testdb));
        contractRepository = new repositories_1.ContractRepository(rentmontior_datasource_1.testdb, clientRepositoryGetter, context_1.Getter.fromValue(new repositories_1.TenantRepository(rentmontior_datasource_1.testdb, clientRepositoryGetter)));
    });
    after(async () => { });
    it('should create contract', async function () {
        const dbClient = await database_helpers_1.givenClient({ name: 'Rentmonitor Test' });
        const dbTenant = await database_helpers_1.givenTenant({
            clientId: dbClient.id,
            name: 'Tenant1',
            email: 'name@debitor1.de',
            phone: '+492952999',
        });
        await contractRepository.create({
            clientId: dbClient.id,
            tenantId: dbTenant.id,
            start: new Date(2019, 0, 1),
            end: new Date(2020, 0, 1),
            rentDueEveryMonth: 3,
            rentDueDayOfMonth: 15,
            amount: 5000,
            accountSynchronisationName: 'accountSynchronisation',
        });
        const contractFromDb = await contractRepository.find();
        testlab_1.expect(contractFromDb.length).to.equal(1);
        testlab_1.expect(contractFromDb[0].clientId).to.equal(dbClient.id);
        testlab_1.expect(contractFromDb[0].tenantId).to.equal(dbTenant.id);
        testlab_1.expect(contractFromDb[0].start.getTime()).to.equal(new Date(2019, 0, 1).getTime());
        testlab_1.expect(contractFromDb[0].end.getTime()).to.equal(new Date(2020, 0, 1).getTime());
        testlab_1.expect(contractFromDb[0].rentDueEveryMonth).to.equal(3);
        testlab_1.expect(contractFromDb[0].rentDueDayOfMonth).to.equal(15);
        testlab_1.expect(contractFromDb[0].amount).to.equal(5000);
        testlab_1.expect(contractFromDb[0].accountSynchronisationName).to.equal('accountSynchronisation');
    });
});
//# sourceMappingURL=contract.integration.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const context_1 = require("@loopback/context");
const testlab_1 = require("@loopback/testlab");
const repositories_1 = require("../../../repositories");
const rentmontior_datasource_1 = require("../../fixtures/datasources/rentmontior.datasource");
const database_helpers_1 = require("../../helpers/database.helpers");
describe('Tenant Repository Integration Tests', () => {
    let tenantRepository;
    before('setupApplication', async () => {
        await database_helpers_1.givenEmptyDatabase();
        tenantRepository = new repositories_1.TenantRepository(rentmontior_datasource_1.testdb, context_1.Getter.fromValue(new repositories_1.ClientRepository(rentmontior_datasource_1.testdb)));
    });
    after(async () => { });
    it('should create tenant', async function () {
        const dbClient = await database_helpers_1.givenClient({ name: 'Rentmonitor Test' });
        await tenantRepository.create({
            clientId: dbClient.id,
            name: 'Tenant1',
            email: 'name@tenant1.de',
            phone: '+492952999',
        });
        const tenantFromDb = await tenantRepository.find();
        testlab_1.expect(tenantFromDb.length).to.equal(1);
        testlab_1.expect(tenantFromDb[0].clientId).to.equal(dbClient.id);
        testlab_1.expect(tenantFromDb[0].name).to.equal('Tenant1');
        testlab_1.expect(tenantFromDb[0].email).to.equal('name@tenant1.de');
        testlab_1.expect(tenantFromDb[0].phone).to.equal('+492952999');
    });
});
//# sourceMappingURL=tenant.integration.js.map
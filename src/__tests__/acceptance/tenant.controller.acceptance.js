"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testlab_1 = require("@loopback/testlab");
const repositories_1 = require("../../repositories");
const test_helper_1 = require("./test-helper");
describe('TenantController', () => {
    let app;
    let http;
    before('setupApplication', async () => {
        ({ app, client: http } = await test_helper_1.setupApplication());
    });
    beforeEach(clearDatabase);
    after(async () => {
        await app.stop();
    });
    it('should add new tenant on post', async () => {
        const clientId = await setupClientInDb();
        const debitorName = 'TestDebitor1';
        const res = await createDebitorViaHttp(clientId, debitorName)
            .expect(200)
            .expect('Content-Type', 'application/json');
        testlab_1.expect(res.body.id).to.be.a.Number();
        testlab_1.expect(res.body.name).to.eql(debitorName);
    });
    it('should add tenant with same name twice', async () => {
        const clientId = await setupClientInDb();
        const debitorName = 'TestDebitor1';
        await createDebitorViaHttp(clientId, debitorName);
        const res = await createDebitorViaHttp(clientId, debitorName)
            .expect(200)
            .expect('Content-Type', 'application/json');
        testlab_1.expect(res.body.id).to.be.a.Number();
        testlab_1.expect(res.body.name).to.eql(debitorName);
        let debitorRepository = await app.getRepository(repositories_1.TenantRepository);
        let debitorsFromDb = await debitorRepository.find({
            where: { clientId: clientId },
        });
        testlab_1.expect(debitorsFromDb).length(2);
    });
    async function clearDatabase() {
        await test_helper_1.givenEmptyDatabase(app);
    }
    async function setupClientInDb() {
        let clientRepository = await app.getRepository(repositories_1.ClientRepository);
        let clientFromDb = await clientRepository.create({ name: 'TestClient1' });
        return clientFromDb.id;
    }
    function createDebitorViaHttp(clientId, name) {
        return http
            .post('/tenants')
            .send({ clientId: clientId, name: name })
            .set('Content-Type', 'application/json');
    }
});
//# sourceMappingURL=tenant.controller.acceptance.js.map
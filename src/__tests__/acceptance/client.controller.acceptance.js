"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testlab_1 = require("@loopback/testlab");
const test_helper_1 = require("./test-helper");
describe('ClientController', () => {
    let app;
    let client;
    before('setupApplication', async () => {
        ({ app, client } = await test_helper_1.setupApplication());
    });
    beforeEach(clearDatabase);
    after(async () => {
        await app.stop();
    });
    it('should add new client on post', async () => {
        const clientName = 'TestClient1';
        const res = await createClient(clientName)
            .expect(200)
            .expect('Content-Type', 'application/json');
        testlab_1.expect(res.body.id).to.be.a.Number();
        testlab_1.expect(res.body.name).to.eql(clientName);
    });
    it('should return 400 if adding same client name twice', async () => {
        const clientName = 'TestClient1';
        await createClient(clientName).expect(200);
        const res = await createClient(clientName)
            .expect(400)
            .expect('Content-Type', 'application/json; charset=utf-8');
        testlab_1.expect(res.body.error.statusCode).to.eql(400);
        testlab_1.expect(res.body.error.name).to.eql('BadRequestError');
        testlab_1.expect(res.body.error.message).to.eql("Client name: 'TestClient1' already exists");
    });
    async function clearDatabase() {
        await test_helper_1.givenEmptyDatabase(app);
    }
    function createClient(name) {
        return client
            .post('/clients')
            .send({ name: name })
            .set('Content-Type', 'application/json');
    }
});
//# sourceMappingURL=client.controller.acceptance.js.map
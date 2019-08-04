"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testlab_1 = require("@loopback/testlab");
const fints_service_1 = require("../../../services/accountsynchronisation/fints.service");
describe.skip('FinTs Integration', () => {
    let fints;
    before('setupApplication', async () => {
        fints = new fints_service_1.FintsAccountTransactionSynchronizationService();
    });
    after(async () => { });
    /* tslint:disable:no-invalid-this */
    it('should get account transactions', async function () {
        this.timeout(8000);
        // when
        const finTsAccountTransactions = await fints.load(process.env.FINTS_BLZ, process.env.FINTS_URL, process.env.FINTS_USER, process.env.FINTS_PASSWORD);
        // then
        testlab_1.expect(finTsAccountTransactions.length).to.be.above(0);
    });
    /* tslint:enable:no-invalid-this */
});
//# sourceMappingURL=fints.integration.js.map
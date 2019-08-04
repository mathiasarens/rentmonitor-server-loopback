"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testlab_1 = require("@loopback/testlab");
const __1 = require("../..");
const repositories_1 = require("../../repositories");
async function setupApplication() {
    const config = testlab_1.givenHttpServerConfig();
    config.host = '127.0.0.1';
    const app = new __1.RentmonitorServerApplication({
        //rest: givenHttpServerConfig(),
        rest: config,
    });
    app.bind('datasources.encryption.password').to('test');
    await app.boot();
    await app.start();
    const client = testlab_1.createRestAppClient(app);
    return { app, client };
}
exports.setupApplication = setupApplication;
async function givenEmptyDatabase(app) {
    const tenantRepository = await app.getRepository(repositories_1.TenantRepository);
    const bookingRepository = await app.getRepository(repositories_1.BookingRepository);
    const clientRepository = await app.getRepository(repositories_1.ClientRepository);
    const accountTransactionRepository = await app.getRepository(repositories_1.AccountTransactionRepository);
    const contractRepository = await app.getRepository(repositories_1.ContractRepository);
    const accountSettingsRepository = await app.getRepository(repositories_1.AccountSettingsRepository);
    const accountTransactionLogRepository = await app.getRepository(repositories_1.AccountTransactionRepository);
    await accountTransactionRepository.deleteAll();
    await bookingRepository.deleteAll();
    await contractRepository.deleteAll();
    await tenantRepository.deleteAll();
    await accountSettingsRepository.deleteAll();
    await accountTransactionLogRepository.deleteAll();
    await clientRepository.deleteAll();
}
exports.givenEmptyDatabase = givenEmptyDatabase;
//# sourceMappingURL=test-helper.js.map
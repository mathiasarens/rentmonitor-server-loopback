"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const context_1 = require("@loopback/context");
const repositories_1 = require("../../repositories");
const rentmontior_datasource_1 = require("../fixtures/datasources/rentmontior.datasource");
async function givenEmptyDatabase() {
    const clientRepository = new repositories_1.ClientRepository(rentmontior_datasource_1.testdb);
    const clientRepositoryGetter = context_1.Getter.fromValue(clientRepository);
    const tenantRepository = new repositories_1.TenantRepository(rentmontior_datasource_1.testdb, clientRepositoryGetter);
    const tenantRepositoryGetter = context_1.Getter.fromValue(tenantRepository);
    const contractRepository = new repositories_1.ContractRepository(rentmontior_datasource_1.testdb, clientRepositoryGetter, tenantRepositoryGetter);
    const bookingRepository = new repositories_1.BookingRepository(rentmontior_datasource_1.testdb, clientRepositoryGetter, tenantRepositoryGetter, context_1.Getter.fromValue(contractRepository));
    const accountTransactionLogRepository = new repositories_1.AccountTransactionLogRepository(rentmontior_datasource_1.testdb, clientRepositoryGetter);
    const accountSettingsRepository = new repositories_1.AccountSettingsRepository(rentmontior_datasource_1.testdb, clientRepositoryGetter, 'test_password');
    const accountTransactionRepository = new repositories_1.AccountTransactionRepository(rentmontior_datasource_1.testdb, clientRepositoryGetter, context_1.Getter.fromValue(bookingRepository));
    await accountTransactionRepository.deleteAll();
    await bookingRepository.deleteAll();
    await contractRepository.deleteAll();
    await tenantRepository.deleteAll();
    await accountSettingsRepository.deleteAll();
    await accountTransactionLogRepository.deleteAll();
    await clientRepository.deleteAll();
}
exports.givenEmptyDatabase = givenEmptyDatabase;
function givenClientData(data) {
    return Object.assign({
        name: 'Test-Konto',
    }, data);
}
exports.givenClientData = givenClientData;
function givenDebitorData(data) {
    return Object.assign({
        name: 'Test-Debitor',
    }, data);
}
exports.givenDebitorData = givenDebitorData;
async function givenClient(data) {
    return await new repositories_1.ClientRepository(rentmontior_datasource_1.testdb).create(givenClientData(data));
}
exports.givenClient = givenClient;
async function givenTenant(data) {
    return await new repositories_1.TenantRepository(rentmontior_datasource_1.testdb, context_1.Getter.fromValue(new repositories_1.ClientRepository(rentmontior_datasource_1.testdb))).create(givenDebitorData(data));
}
exports.givenTenant = givenTenant;
//# sourceMappingURL=database.helpers.js.map
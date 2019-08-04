"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
const context_1 = require("@loopback/context");
const repository_1 = require("@loopback/repository");
const testlab_1 = require("@loopback/testlab");
const datasources_1 = require("../../../datasources");
const models_1 = require("../../../models");
const repositories_1 = require("../../../repositories");
const rentmontior_datasource_1 = require("../../fixtures/datasources/rentmontior.datasource");
const database_helpers_1 = require("../../helpers/database.helpers");
describe('Account Settings Repository Integration Tests', () => {
    let clientRepository;
    let accountSettingsRepository;
    let accountSettingsRepositoryInternal;
    beforeEach('setupApplication', async () => {
        await database_helpers_1.givenEmptyDatabase();
        clientRepository = new repositories_1.ClientRepository(rentmontior_datasource_1.testdb);
        const clientRepositoryGetter = context_1.Getter.fromValue(clientRepository);
        accountSettingsRepository = new repositories_1.AccountSettingsRepository(rentmontior_datasource_1.testdb, clientRepositoryGetter, 'test_password');
        accountSettingsRepositoryInternal = new AccountSettingsRepositoryInternal(rentmontior_datasource_1.testdb, clientRepositoryGetter);
    });
    after(async () => { });
    it('should create empty accountSettings', async function () {
        // given
        const dbClient = await clientRepository.create({
            name: 'Rentmonitor Test',
        });
        // when
        await accountSettingsRepository.create({
            clientId: dbClient.id,
            fintsBlz: '12345678',
            fintsUrl: 'https://fints.bank.com',
            fintsUser: 'login',
            fintsPassword: 'password',
        });
        // then
        const encryptedAccountSettingsFromDb = await accountSettingsRepositoryInternal.find();
        testlab_1.expect(encryptedAccountSettingsFromDb.length).to.equal(1);
        testlab_1.expect(encryptedAccountSettingsFromDb[0].clientId).to.equal(dbClient.id);
        testlab_1.expect(encryptedAccountSettingsFromDb[0].fintsBlz).to.equal('de2ebd388e12e4fc4e74001a7b5cb309');
        testlab_1.expect(encryptedAccountSettingsFromDb[0].fintsPassword).to.equal('3c0f03113526e7bf2335d3e03ae05c31');
        testlab_1.expect(encryptedAccountSettingsFromDb[0].fintsUrl).to.equal('adfcad3fa1baedfe4ebec0287b20126ffe3d1c81dd19d6eb90158a8c9ab89940');
        testlab_1.expect(encryptedAccountSettingsFromDb[0].fintsUser).to.equal('b38c9ce5c926311c0e38828cf738d7ff');
        const accountSettingsFromDb = await accountSettingsRepository.find();
        testlab_1.expect(accountSettingsFromDb.length).to.equal(1);
        testlab_1.expect(accountSettingsFromDb[0].clientId).to.equal(dbClient.id);
        testlab_1.expect(accountSettingsFromDb[0].fintsBlz).to.equal('12345678');
        testlab_1.expect(accountSettingsFromDb[0].fintsUrl).to.equal('https://fints.bank.com');
        testlab_1.expect(accountSettingsFromDb[0].fintsUser).to.equal('login');
        testlab_1.expect(accountSettingsFromDb[0].fintsPassword).to.equal('password');
    });
    it('should create empty accountSettings', async function () {
        // given
        const dbClient = await clientRepository.create({
            name: 'Rentmonitor Test',
        });
        // when
        await accountSettingsRepository.create({
            clientId: dbClient.id,
        });
        // then
        const contractFromDb = await accountSettingsRepositoryInternal.find();
        testlab_1.expect(contractFromDb.length).to.equal(1);
        testlab_1.expect(contractFromDb[0].clientId).to.equal(dbClient.id);
        testlab_1.expect(contractFromDb[0].fintsBlz).to.equal(null);
        testlab_1.expect(contractFromDb[0].fintsPassword).to.equal(null);
        testlab_1.expect(contractFromDb[0].fintsUrl).to.equal(null);
        testlab_1.expect(contractFromDb[0].fintsUser).to.equal(null);
    });
});
let AccountSettingsRepositoryInternal = class AccountSettingsRepositoryInternal extends repository_1.DefaultCrudRepository {
    constructor(dataSource, clientRepositoryGetter) {
        super(models_1.AccountSettings, dataSource);
        this.client = this.createBelongsToAccessorFor('client', clientRepositoryGetter);
    }
};
AccountSettingsRepositoryInternal = __decorate([
    __param(0, context_1.inject('datasources.rentmonitor')),
    __param(1, repository_1.repository.getter('ClientRepository')),
    __metadata("design:paramtypes", [datasources_1.RentmonitorDataSource, Function])
], AccountSettingsRepositoryInternal);
//# sourceMappingURL=account-settings.integration.js.map
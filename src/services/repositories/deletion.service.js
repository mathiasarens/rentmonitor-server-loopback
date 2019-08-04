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
const repository_1 = require("@loopback/repository");
const repositories_1 = require("../../repositories");
let DeletionService = class DeletionService {
    constructor(clientRepository, tenantRepository, contractRepository, bookingRepository, accountSettingsRepository, accountTransactionRepository, accountTransactionLogRepository) {
        this.clientRepository = clientRepository;
        this.tenantRepository = tenantRepository;
        this.contractRepository = contractRepository;
        this.bookingRepository = bookingRepository;
        this.accountSettingsRepository = accountSettingsRepository;
        this.accountTransactionRepository = accountTransactionRepository;
        this.accountTransactionLogRepository = accountTransactionLogRepository;
    }
    async deleteAll() {
        await this.bookingRepository.deleteAll();
        await this.contractRepository.deleteAll();
        await this.tenantRepository.deleteAll();
        await this.accountTransactionLogRepository.deleteAll();
        await this.accountTransactionRepository.deleteAll();
        await this.accountSettingsRepository.deleteAll();
        await this.clientRepository.deleteAll();
    }
    async deleteClient(clientId) {
        const where = { clientId: clientId };
        await this.bookingRepository.deleteAll(where);
        await this.contractRepository.deleteAll(where);
        await this.tenantRepository.deleteAll(where);
        await this.accountTransactionLogRepository.deleteAll(where);
        await this.accountTransactionRepository.deleteAll(where);
        await this.accountSettingsRepository.deleteAll(where);
        await this.clientRepository.deleteById(clientId);
    }
};
DeletionService = __decorate([
    __param(0, repository_1.repository(repositories_1.ClientRepository)),
    __param(1, repository_1.repository(repositories_1.TenantRepository)),
    __param(2, repository_1.repository(repositories_1.ContractRepository)),
    __param(3, repository_1.repository(repositories_1.BookingRepository)),
    __param(4, repository_1.repository(repositories_1.AccountSettingsRepository)),
    __param(5, repository_1.repository(repositories_1.AccountTransactionRepository)),
    __param(6, repository_1.repository(repositories_1.AccountTransactionLogRepository)),
    __metadata("design:paramtypes", [repositories_1.ClientRepository,
        repositories_1.TenantRepository,
        repositories_1.ContractRepository,
        repositories_1.BookingRepository,
        repositories_1.AccountSettingsRepository,
        repositories_1.AccountTransactionRepository,
        repositories_1.AccountTransactionLogRepository])
], DeletionService);
exports.DeletionService = DeletionService;
//# sourceMappingURL=deletion.service.js.map
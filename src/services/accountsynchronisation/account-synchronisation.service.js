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
const core_1 = require("@loopback/core");
const repository_1 = require("@loopback/repository");
const models_1 = require("../../models");
const repositories_1 = require("../../repositories");
const account_transaction_log_repository_1 = require("../../repositories/account-transaction-log.repository");
const account_synchronisation_booking_service_1 = require("./account-synchronisation-booking.service");
const account_synchronisation_transaction_service_1 = require("./account-synchronisation-transaction.service");
const fints_service_1 = require("./fints.service");
let AccountSynchronisationService = class AccountSynchronisationService {
    constructor(accountSettingsRepository, accountTransactionLogRepository, fintsAccountTransactionSynchronization, accountSynchronisationSaveService, accountSynchronisationBookingService) {
        this.accountSettingsRepository = accountSettingsRepository;
        this.accountTransactionLogRepository = accountTransactionLogRepository;
        this.fintsAccountTransactionSynchronization = fintsAccountTransactionSynchronization;
        this.accountSynchronisationSaveService = accountSynchronisationSaveService;
        this.accountSynchronisationBookingService = accountSynchronisationBookingService;
    }
    async retrieveAndSaveNewAccountTransactionsAndCreateNewBookings(now, clientId) {
        const accountSettingsList = await this.accountSettingsRepository.find({ where: { clientId: clientId } });
        let newAccountTransactionsFromAccounts = [];
        for (const accountSettings of accountSettingsList) {
            try {
                const newTransactions = await this.retrieveAndSaveNewAccountTransactions(now, accountSettings);
                newAccountTransactionsFromAccounts = newAccountTransactionsFromAccounts.concat(newTransactions);
            }
            catch (error) {
                console.error(error);
            }
        }
        await this.accountSynchronisationBookingService.createAndSaveBookings(clientId, newAccountTransactionsFromAccounts, now);
    }
    async retrieveAndSaveNewAccountTransactions(now, accountSettings) {
        const rawAccountTransactions = await this.fintsAccountTransactionSynchronization.load(accountSettings.fintsBlz, accountSettings.fintsUrl, accountSettings.fintsUser, accountSettings.fintsPassword);
        await this.logAccountTransactions(now, accountSettings, rawAccountTransactions);
        const accountTransactions = rawAccountTransactions.map(at => this.convertToAccountTransaction(accountSettings, at));
        const newAccountTransactions = await this.accountSynchronisationSaveService.saveNewAccountTransactions(accountSettings, accountTransactions);
        return newAccountTransactions;
    }
    convertToAccountTransaction(accountSettings, rawAccountTransaction) {
        return new models_1.AccountTransaction({
            clientId: accountSettings.clientId,
            accountSettingsId: accountSettings.id,
            date: rawAccountTransaction.date,
            name: rawAccountTransaction.name,
            bic: rawAccountTransaction.bic,
            iban: rawAccountTransaction.iban,
            text: rawAccountTransaction.text,
            amount: rawAccountTransaction.value,
        });
    }
    async logAccountTransactions(now, accountSettings, rawAccountTransactions) {
        const accountTransactionsToSave = rawAccountTransactions.map(at => new models_1.AccountTransactionLog({
            clientId: accountSettings.clientId,
            accountSettingsId: accountSettings.id,
            time: now,
            rawstring: at.rawstring,
        }));
        await this.accountTransactionLogRepository.createAll(accountTransactionsToSave);
    }
};
AccountSynchronisationService = __decorate([
    __param(0, repository_1.repository(repositories_1.AccountSettingsRepository)),
    __param(1, repository_1.repository(account_transaction_log_repository_1.AccountTransactionLogRepository)),
    __param(2, core_1.inject('services.accountsynchronisation.FintsAccountTransactionSynchronization')),
    __param(3, core_1.inject('services.accountsynchronisation.AccountSynchronisationSaveService')),
    __param(4, core_1.inject('services.accountsynchronisation.AccountSynchronisationBookingService')),
    __metadata("design:paramtypes", [repositories_1.AccountSettingsRepository,
        account_transaction_log_repository_1.AccountTransactionLogRepository,
        fints_service_1.FintsAccountTransactionSynchronizationService,
        account_synchronisation_transaction_service_1.AccountSynchronisationSaveService,
        account_synchronisation_booking_service_1.AccountSynchronisationBookingService])
], AccountSynchronisationService);
exports.AccountSynchronisationService = AccountSynchronisationService;
//# sourceMappingURL=account-synchronisation.service.js.map
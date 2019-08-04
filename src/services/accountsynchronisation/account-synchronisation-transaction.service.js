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
const account_transaction_repository_1 = require("../../repositories/account-transaction.repository");
let AccountSynchronisationSaveService = class AccountSynchronisationSaveService {
    constructor(accountTransactionRepository) {
        this.accountTransactionRepository = accountTransactionRepository;
    }
    async saveNewAccountTransactions(accountSettings, accountTransactions) {
        const newAccountTransactionsInAscendingOrder = accountTransactions.sort(this.compareByDateIbanBicNameTextValue);
        const alreadySavedAccountTransactionsFromDb = (await this.findAlreadySavedAccountTransactions(newAccountTransactionsInAscendingOrder, accountSettings)).sort(this.compareByDateIbanBicNameTextValue);
        const mergedAccountTransactions = this.merge(alreadySavedAccountTransactionsFromDb, newAccountTransactionsInAscendingOrder);
        const mergedAccountTransactionsFromDb = await this.accountTransactionRepository.createAll(mergedAccountTransactions);
        return mergedAccountTransactionsFromDb;
    }
    merge(existingTransactions, newTransactions) {
        const mergeResult = [];
        let existingTransactionsIndex = 0;
        let newTransactionsIndex = 0;
        while (existingTransactionsIndex < existingTransactions.length ||
            newTransactionsIndex < newTransactions.length) {
            if (existingTransactionsIndex < existingTransactions.length &&
                newTransactionsIndex < newTransactions.length) {
                let compareResult = this.compareByDateIbanBicNameTextValue(existingTransactions[existingTransactionsIndex], newTransactions[newTransactionsIndex]);
                if (compareResult === 0) {
                    existingTransactionsIndex++;
                    newTransactionsIndex++;
                }
                else if (compareResult < 0) {
                    existingTransactionsIndex++;
                }
                else {
                    mergeResult.push(newTransactions[newTransactionsIndex]);
                    newTransactionsIndex++;
                }
            }
            else if (existingTransactionsIndex < existingTransactions.length) {
                existingTransactionsIndex++;
            }
            else if (newTransactionsIndex < newTransactions.length) {
                mergeResult.push(newTransactions[newTransactionsIndex]);
                newTransactionsIndex++;
            }
        }
        return mergeResult;
    }
    async findAlreadySavedAccountTransactions(accountTransactionsInAscendingDateOrder, accountSettings) {
        const latestBookingDate = accountTransactionsInAscendingDateOrder[accountTransactionsInAscendingDateOrder.length - 1].date;
        return this.accountTransactionRepository.find({
            where: {
                clientId: accountSettings.clientId,
                accountSettingsId: accountSettings.id,
                date: { gte: latestBookingDate },
            },
        });
    }
    compareByDateIbanBicNameTextValue(a, b) {
        return ((a.date.getTime === b.date.getTime ? 0 : a.date < b.date ? 1 : -1) ||
            a.iban.localeCompare(b.iban) ||
            a.bic.localeCompare(b.bic) ||
            a.name.localeCompare(b.name) ||
            a.text.localeCompare(b.text) ||
            a.text.localeCompare(b.text) ||
            a.amount - b.amount);
    }
};
AccountSynchronisationSaveService = __decorate([
    __param(0, repository_1.repository(account_transaction_repository_1.AccountTransactionRepository)),
    __metadata("design:paramtypes", [account_transaction_repository_1.AccountTransactionRepository])
], AccountSynchronisationSaveService);
exports.AccountSynchronisationSaveService = AccountSynchronisationSaveService;
//# sourceMappingURL=account-synchronisation-transaction.service.js.map
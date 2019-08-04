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
const models_1 = require("../../models");
const repositories_1 = require("../../repositories");
let AccountSynchronisationBookingService = class AccountSynchronisationBookingService {
    constructor(contractRepository, bookingRepository, accountTransactionRepository) {
        this.contractRepository = contractRepository;
        this.bookingRepository = bookingRepository;
        this.accountTransactionRepository = accountTransactionRepository;
    }
    async createAndSaveBookings(clientId, accountTransactions, now) {
        const activeContracts = await this.contractRepository.findActiveContracts(clientId, now);
        return this.createAndSaveBookingsByContracts(accountTransactions, activeContracts, now);
    }
    async createAndSaveBookingsByContracts(accountTransactions, activeContracts, now) {
        let unmachtedAccountTransactions = [];
        let bookings = [];
        for (let accountTransaction of accountTransactions) {
            let matched = false;
            for (let contract of activeContracts) {
                if (this.matchAccountTransactionAndContract(accountTransaction, contract)) {
                    const booking = this.createBookingFromAccountTransactionAndContract(accountTransaction, contract);
                    const bookingFromDb = await this.bookingRepository.create(booking);
                    accountTransaction.bookingId = bookingFromDb.id;
                    await this.accountTransactionRepository.update(accountTransaction);
                    bookings.push(bookingFromDb);
                    matched = true;
                    break;
                }
            }
            if (!matched) {
                unmachtedAccountTransactions.push(accountTransaction);
            }
        }
        return [bookings, unmachtedAccountTransactions];
    }
    matchAccountTransactionAndContract(accountTransaction, contract) {
        return contract.accountSynchronisationName === accountTransaction.name;
    }
    createBookingFromAccountTransactionAndContract(accountTransaction, contract) {
        return new models_1.Booking({
            clientId: contract.clientId,
            tenantId: contract.tenantId,
            contractId: contract.id,
            date: accountTransaction.date,
            comment: accountTransaction.text,
            amount: accountTransaction.amount,
            type: models_1.BookingType.RENT_DUE,
            accountTransactionId: accountTransaction.id,
        });
    }
};
AccountSynchronisationBookingService = __decorate([
    __param(0, repository_1.repository(repositories_1.ContractRepository)),
    __param(1, repository_1.repository(repositories_1.BookingRepository)),
    __param(2, repository_1.repository(repositories_1.AccountTransactionRepository)),
    __metadata("design:paramtypes", [repositories_1.ContractRepository,
        repositories_1.BookingRepository,
        repositories_1.AccountTransactionRepository])
], AccountSynchronisationBookingService);
exports.AccountSynchronisationBookingService = AccountSynchronisationBookingService;
//# sourceMappingURL=account-synchronisation-booking.service.js.map
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
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@loopback/core");
const openfin_ts_1 = require("openfin-ts");
let FintsAccountTransactionSynchronizationService = class FintsAccountTransactionSynchronizationService {
    constructor() { }
    async load(fintsBlz, fintsUrl, fintsUser, fintsPassword) {
        let accountTransactions = [];
        try {
            const fintsClient = new openfin_ts_1.FinTSClient(fintsBlz, fintsUrl, fintsUser, fintsPassword);
            await fintsClient.connect();
            const transactions = await fintsClient.getTransactions(fintsClient.konten[0].sepaData, null, null);
            transactions.forEach(transaction => {
                transaction.records.forEach(transactionRecord => {
                    accountTransactions.push(this.parseFinTsTransactionRecord(transactionRecord));
                });
            });
            await fintsClient.close();
            return Promise.resolve(accountTransactions);
        }
        catch (err) {
            console.log(err);
            return Promise.reject();
        }
    }
    parseFinTsTransactionRecord(transactionRecord) {
        try {
            return new FinTsAccountTransactionDTO(JSON.stringify(transactionRecord), transactionRecord.date, transactionRecord.description.nameKontrahent.replace('undefined', ''), transactionRecord.description.ibanKontrahent, transactionRecord.description.bicKontrahent, transactionRecord.description.text, this.parseValueFromFinTsTransactionRecord(transactionRecord));
        }
        catch (err) {
            console.log(err);
            return new FinTsAccountTransactionDTO(JSON.stringify(transactionRecord));
        }
    }
    parseValueFromFinTsTransactionRecord(transactionRecord) {
        let value = parseInt(transactionRecord.value
            .toString()
            .split('.')
            .join(''));
        if (transactionRecord.transactionType === 'S') {
            value = value * -1;
        }
        return value;
    }
};
FintsAccountTransactionSynchronizationService = __decorate([
    core_1.bind({
        scope: core_1.BindingScope.SINGLETON,
        tags: ['service'],
    }),
    __metadata("design:paramtypes", [])
], FintsAccountTransactionSynchronizationService);
exports.FintsAccountTransactionSynchronizationService = FintsAccountTransactionSynchronizationService;
class FinTsAccountTransactionDTO {
    constructor(rawstring, date, name, iban, bic, text, value) {
        this.rawstring = rawstring;
        this.date = date;
        this.name = name;
        this.iban = iban;
        this.bic = bic;
        this.text = text;
        this.value = value;
    }
}
exports.FinTsAccountTransactionDTO = FinTsAccountTransactionDTO;
//# sourceMappingURL=fints.service.js.map
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
const repository_1 = require("@loopback/repository");
const account_settings_model_1 = require("./account-settings.model");
const booking_model_1 = require("./booking.model");
const client_model_1 = require("./client.model");
let AccountTransaction = class AccountTransaction extends repository_1.Entity {
    constructor(data) {
        super(data);
    }
};
__decorate([
    repository_1.property({
        type: 'number',
        id: true,
        generated: true,
    }),
    __metadata("design:type", Number)
], AccountTransaction.prototype, "id", void 0);
__decorate([
    repository_1.belongsTo(() => client_model_1.Client),
    __metadata("design:type", Number)
], AccountTransaction.prototype, "clientId", void 0);
__decorate([
    repository_1.belongsTo(() => account_settings_model_1.AccountSettings),
    __metadata("design:type", Number)
], AccountTransaction.prototype, "accountSettingsId", void 0);
__decorate([
    repository_1.property({
        type: 'date',
        required: true,
    }),
    __metadata("design:type", Date)
], AccountTransaction.prototype, "date", void 0);
__decorate([
    repository_1.property({
        type: 'string',
    }),
    __metadata("design:type", String)
], AccountTransaction.prototype, "name", void 0);
__decorate([
    repository_1.property({
        type: 'string',
    }),
    __metadata("design:type", String)
], AccountTransaction.prototype, "iban", void 0);
__decorate([
    repository_1.property({
        type: 'string',
    }),
    __metadata("design:type", String)
], AccountTransaction.prototype, "bic", void 0);
__decorate([
    repository_1.property({
        type: 'string',
    }),
    __metadata("design:type", String)
], AccountTransaction.prototype, "text", void 0);
__decorate([
    repository_1.property({
        type: 'number',
    }),
    __metadata("design:type", Number)
], AccountTransaction.prototype, "amount", void 0);
__decorate([
    repository_1.belongsTo(() => booking_model_1.Booking),
    __metadata("design:type", Number)
], AccountTransaction.prototype, "bookingId", void 0);
AccountTransaction = __decorate([
    repository_1.model(),
    __metadata("design:paramtypes", [Object])
], AccountTransaction);
exports.AccountTransaction = AccountTransaction;
//# sourceMappingURL=account-transaction.model.js.map
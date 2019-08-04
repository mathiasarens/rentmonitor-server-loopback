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
const _1 = require(".");
const account_transaction_model_1 = require("./account-transaction.model");
const client_model_1 = require("./client.model");
const tenant_model_1 = require("./tenant.model");
let Booking = class Booking extends repository_1.Entity {
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
], Booking.prototype, "id", void 0);
__decorate([
    repository_1.belongsTo(() => client_model_1.Client),
    __metadata("design:type", Number)
], Booking.prototype, "clientId", void 0);
__decorate([
    repository_1.belongsTo(() => tenant_model_1.Tenant),
    __metadata("design:type", Number)
], Booking.prototype, "tenantId", void 0);
__decorate([
    repository_1.belongsTo(() => _1.Contract),
    __metadata("design:type", Number)
], Booking.prototype, "contractId", void 0);
__decorate([
    repository_1.belongsTo(() => account_transaction_model_1.AccountTransaction),
    __metadata("design:type", Number)
], Booking.prototype, "accountTransactionId", void 0);
__decorate([
    repository_1.property({
        type: 'date',
        required: true,
    }),
    __metadata("design:type", Date)
], Booking.prototype, "date", void 0);
__decorate([
    repository_1.property({
        type: 'string',
    }),
    __metadata("design:type", String)
], Booking.prototype, "comment", void 0);
__decorate([
    repository_1.property({
        type: 'number',
    }),
    __metadata("design:type", Number)
], Booking.prototype, "amount", void 0);
__decorate([
    repository_1.property({
        type: 'string',
    }),
    __metadata("design:type", String)
], Booking.prototype, "type", void 0);
Booking = __decorate([
    repository_1.model(),
    __metadata("design:paramtypes", [Object])
], Booking);
exports.Booking = Booking;
var BookingType;
(function (BookingType) {
    BookingType["RENT_DUE"] = "RENT_DUE";
})(BookingType = exports.BookingType || (exports.BookingType = {}));
//# sourceMappingURL=booking.model.js.map
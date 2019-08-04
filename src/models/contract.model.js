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
let Contract = class Contract extends repository_1.Entity {
    constructor(data) {
        super(data);
    }
    isActive(now) {
        return now > this.start && now < this.end;
    }
};
__decorate([
    repository_1.property({
        type: 'number',
        id: true,
        generated: true,
    }),
    __metadata("design:type", Number)
], Contract.prototype, "id", void 0);
__decorate([
    repository_1.belongsTo(() => _1.Client),
    __metadata("design:type", Number)
], Contract.prototype, "clientId", void 0);
__decorate([
    repository_1.belongsTo(() => _1.Tenant),
    __metadata("design:type", Number)
], Contract.prototype, "tenantId", void 0);
__decorate([
    repository_1.property({
        type: 'date',
    }),
    __metadata("design:type", Date)
], Contract.prototype, "start", void 0);
__decorate([
    repository_1.property({
        type: 'date',
    }),
    __metadata("design:type", Date)
], Contract.prototype, "end", void 0);
__decorate([
    repository_1.property({
        type: 'number',
    }),
    __metadata("design:type", Number)
], Contract.prototype, "rentDueEveryMonth", void 0);
__decorate([
    repository_1.property({
        type: 'number',
    }),
    __metadata("design:type", Number)
], Contract.prototype, "rentDueDayOfMonth", void 0);
__decorate([
    repository_1.property({
        type: 'number',
    }),
    __metadata("design:type", Number)
], Contract.prototype, "amount", void 0);
__decorate([
    repository_1.property({
        type: 'string',
    }),
    __metadata("design:type", String)
], Contract.prototype, "accountSynchronisationName", void 0);
Contract = __decorate([
    repository_1.model(),
    __metadata("design:paramtypes", [Object])
], Contract);
exports.Contract = Contract;
//# sourceMappingURL=contract.model.js.map
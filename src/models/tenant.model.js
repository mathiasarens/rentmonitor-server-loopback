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
const client_model_1 = require("./client.model");
let Tenant = class Tenant extends repository_1.Entity {
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
], Tenant.prototype, "id", void 0);
__decorate([
    repository_1.belongsTo(() => client_model_1.Client),
    __metadata("design:type", Number)
], Tenant.prototype, "clientId", void 0);
__decorate([
    repository_1.hasMany(() => _1.Contract),
    __metadata("design:type", Array)
], Tenant.prototype, "contracts", void 0);
__decorate([
    repository_1.property({
        type: 'string',
        required: true,
    }),
    __metadata("design:type", String)
], Tenant.prototype, "name", void 0);
__decorate([
    repository_1.property({
        type: 'string',
    }),
    __metadata("design:type", String)
], Tenant.prototype, "email", void 0);
__decorate([
    repository_1.property({
        type: 'string',
    }),
    __metadata("design:type", String)
], Tenant.prototype, "phone", void 0);
Tenant = __decorate([
    repository_1.model({
        indexes: {
            clientId_name_index: {
                keys: { clientId: 1, name: 1 },
                options: { unique: true },
            },
        },
    }),
    __metadata("design:paramtypes", [Object])
], Tenant);
exports.Tenant = Tenant;
//# sourceMappingURL=tenant.model.js.map
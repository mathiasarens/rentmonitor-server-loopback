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
const datasources_1 = require("../datasources");
const models_1 = require("../models");
const crypto_service_1 = require("../services/cipher/crypto.service");
let AccountSettingsRepository = class AccountSettingsRepository {
    constructor(dataSource, clientRepositoryGetter, password) {
        this.proxy = new AccountSettingsRepositoryInternal(dataSource, clientRepositoryGetter);
        this.crypto = new crypto_service_1.Crypto('aes-192-cbc', password, '!!RentMonitor!!');
    }
    async create(entity, options) {
        if (entity.fintsBlz) {
            entity.fintsBlz = await this.crypto.encrypt(entity.fintsBlz);
        }
        if (entity.fintsUrl) {
            entity.fintsUrl = await this.crypto.encrypt(entity.fintsUrl);
        }
        if (entity.fintsUser) {
            entity.fintsUser = await this.crypto.encrypt(entity.fintsUser);
        }
        if (entity.fintsPassword) {
            entity.fintsPassword = await this.crypto.encrypt(entity.fintsPassword);
        }
        return this.proxy.create(entity, options);
    }
    async find(filter, options) {
        const results = await this.proxy.find(filter, options);
        for (const result of results) {
            if (result.fintsBlz) {
                result.fintsBlz = await this.crypto.decrypt(result.fintsBlz);
            }
            if (result.fintsUrl) {
                result.fintsUrl = await this.crypto.decrypt(result.fintsUrl);
            }
            if (result.fintsUser) {
                result.fintsUser = await this.crypto.decrypt(result.fintsUser);
            }
            if (result.fintsPassword) {
                result.fintsPassword = await this.crypto.decrypt(result.fintsPassword);
            }
        }
        return Promise.resolve(results);
    }
    exists(id, options) {
        return this.proxy.exists(id, options);
    }
    deleteAll(where, options) {
        return this.proxy.deleteAll(where, options);
    }
};
AccountSettingsRepository = __decorate([
    __param(0, core_1.inject('datasources.rentmonitor')),
    __param(1, repository_1.repository.getter('ClientRepository')),
    __param(2, core_1.inject('datasources.encryption.password')),
    __metadata("design:paramtypes", [datasources_1.RentmonitorDataSource, Function, String])
], AccountSettingsRepository);
exports.AccountSettingsRepository = AccountSettingsRepository;
let AccountSettingsRepositoryInternal = class AccountSettingsRepositoryInternal extends repository_1.DefaultCrudRepository {
    constructor(dataSource, clientRepositoryGetter) {
        super(models_1.AccountSettings, dataSource);
        this.client = this.createBelongsToAccessorFor('client', clientRepositoryGetter);
    }
};
AccountSettingsRepositoryInternal = __decorate([
    __param(0, core_1.inject('datasources.rentmonitor')),
    __param(1, repository_1.repository.getter('ClientRepository')),
    __metadata("design:paramtypes", [datasources_1.RentmonitorDataSource, Function])
], AccountSettingsRepositoryInternal);
//# sourceMappingURL=account-settings.repository.js.map
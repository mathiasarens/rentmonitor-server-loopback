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
const rest_1 = require("@loopback/rest");
const models_1 = require("../models");
const repositories_1 = require("../repositories");
let ClientController = class ClientController {
    constructor(clientRepository) {
        this.clientRepository = clientRepository;
    }
    async create(client) {
        try {
            return await this.clientRepository.create(client);
        }
        catch (error) {
            if (error.constraint && error.constraint === 'client_name_idx') {
                throw new rest_1.HttpErrors.BadRequest(`Client name: '${client.name}' already exists`);
            }
            else {
                throw error;
            }
        }
    }
    async count(where) {
        return await this.clientRepository.count(where);
    }
    async find(filter) {
        return await this.clientRepository.find(filter);
    }
    async updateAll(client, where) {
        return await this.clientRepository.updateAll(client, where);
    }
    async findById(id) {
        return await this.clientRepository.findById(id);
    }
    async updateById(id, client) {
        await this.clientRepository.updateById(id, client);
    }
    async replaceById(id, client) {
        await this.clientRepository.replaceById(id, client);
    }
    async deleteById(id) {
        await this.clientRepository.deleteById(id);
    }
};
__decorate([
    rest_1.post('/clients', {
        responses: {
            '200': {
                description: 'Client model instance',
                content: { 'application/json': { schema: { 'x-ts-type': models_1.Client } } },
            },
        },
    }),
    __param(0, rest_1.requestBody()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [models_1.Client]),
    __metadata("design:returntype", Promise)
], ClientController.prototype, "create", null);
__decorate([
    rest_1.get('/clients/count', {
        responses: {
            '200': {
                description: 'Client model count',
                content: { 'application/json': { schema: repository_1.CountSchema } },
            },
        },
    }),
    __param(0, rest_1.param.query.object('where', rest_1.getWhereSchemaFor(models_1.Client))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ClientController.prototype, "count", null);
__decorate([
    rest_1.get('/clients', {
        responses: {
            '200': {
                description: 'Array of Client model instances',
                content: {
                    'application/json': {
                        schema: { type: 'array', items: { 'x-ts-type': models_1.Client } },
                    },
                },
            },
        },
    }),
    __param(0, rest_1.param.query.object('filter', rest_1.getFilterSchemaFor(models_1.Client))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ClientController.prototype, "find", null);
__decorate([
    rest_1.patch('/clients', {
        responses: {
            '200': {
                description: 'Client PATCH success count',
                content: { 'application/json': { schema: repository_1.CountSchema } },
            },
        },
    }),
    __param(0, rest_1.requestBody()),
    __param(1, rest_1.param.query.object('where', rest_1.getWhereSchemaFor(models_1.Client))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [models_1.Client, Object]),
    __metadata("design:returntype", Promise)
], ClientController.prototype, "updateAll", null);
__decorate([
    rest_1.get('/clients/{id}', {
        responses: {
            '200': {
                description: 'Client model instance',
                content: { 'application/json': { schema: { 'x-ts-type': models_1.Client } } },
            },
        },
    }),
    __param(0, rest_1.param.path.number('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], ClientController.prototype, "findById", null);
__decorate([
    rest_1.patch('/clients/{id}', {
        responses: {
            '204': {
                description: 'Client PATCH success',
            },
        },
    }),
    __param(0, rest_1.param.path.number('id')),
    __param(1, rest_1.requestBody()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, models_1.Client]),
    __metadata("design:returntype", Promise)
], ClientController.prototype, "updateById", null);
__decorate([
    rest_1.put('/clients/{id}', {
        responses: {
            '204': {
                description: 'Client PUT success',
            },
        },
    }),
    __param(0, rest_1.param.path.number('id')),
    __param(1, rest_1.requestBody()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, models_1.Client]),
    __metadata("design:returntype", Promise)
], ClientController.prototype, "replaceById", null);
__decorate([
    rest_1.del('/clients/{id}', {
        responses: {
            '204': {
                description: 'Client DELETE success',
            },
        },
    }),
    __param(0, rest_1.param.path.number('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], ClientController.prototype, "deleteById", null);
ClientController = __decorate([
    __param(0, repository_1.repository(repositories_1.ClientRepository)),
    __metadata("design:paramtypes", [repositories_1.ClientRepository])
], ClientController);
exports.ClientController = ClientController;
//# sourceMappingURL=client.controller.js.map
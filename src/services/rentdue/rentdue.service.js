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
const latest_rent_due_booking_1 = require("./latest.rent.due.booking");
const rentdue_calculation_service_1 = require("./rentdue.calculation.service");
let RentDueService = class RentDueService {
    constructor(tenantRepository, contractRepository, bookingRepository, rentDueCalculationService) {
        this.tenantRepository = tenantRepository;
        this.contractRepository = contractRepository;
        this.bookingRepository = bookingRepository;
        this.rentDueCalculationService = rentDueCalculationService;
    }
    async calculateRentDueAndSaveResultsToDatabase(clientId, now) {
        const latestBookingDatesPerDebitor = await this.findLatestRentDueBookingsForDebitors(clientId);
        const rentDueBookings = await this.rentDueCalculationService.calculateRentDueBookings(now, latestBookingDatesPerDebitor);
        await this.bookingRepository.createAll(rentDueBookings);
    }
    async findLatestRentDueBookingsForDebitors(clientId) {
        const result = new Array();
        const tenants = await this.tenantRepository.find({
            where: { clientId: clientId },
        });
        for (let tenant of tenants) {
            const contractsPerTenant = await this.contractRepository.find({ where: { clientId: clientId, tenantId: tenant.id } });
            for (let contract of contractsPerTenant) {
                const latestBookingDate = await this.findLatestBookingForTenantAndContract(clientId, tenant, contract);
                result.push(new latest_rent_due_booking_1.LatestRentDueBooking(contract, latestBookingDate));
            }
        }
        return Promise.resolve(result);
    }
    async findLatestBookingForTenantAndContract(clientId, tenant, contract) {
        let booking = await this.bookingRepository.findOne({
            where: {
                clientId: clientId,
                tenantId: tenant.id,
                contractId: contract.id,
                type: models_1.BookingType.RENT_DUE,
            },
            order: ['date DESC'],
            limit: 1,
        });
        return Promise.resolve(booking.date);
    }
};
RentDueService = __decorate([
    __param(0, repository_1.repository(repositories_1.TenantRepository)),
    __param(1, repository_1.repository(repositories_1.ContractRepository)),
    __param(2, repository_1.repository(repositories_1.BookingRepository)),
    __param(3, core_1.inject('RentDueCalculationService')),
    __metadata("design:paramtypes", [repositories_1.TenantRepository,
        repositories_1.ContractRepository,
        repositories_1.BookingRepository,
        rentdue_calculation_service_1.RentDueCalculationService])
], RentDueService);
exports.RentDueService = RentDueService;
//# sourceMappingURL=rentdue.service.js.map
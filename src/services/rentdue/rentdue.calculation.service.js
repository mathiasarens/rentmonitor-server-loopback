"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const models_1 = require("../../models");
class RentDueCalculationService {
    async calculateRentDueBookings(today, latestRentDueBookingsPerTenant) {
        let result = new Array();
        for (let latestRentDueBooking of latestRentDueBookingsPerTenant) {
            const booking = this.calculateRentDueBookingsPerContract(today, latestRentDueBooking.contract, latestRentDueBooking.bookingDate);
            result = result.concat([], booking);
        }
        return Promise.resolve(result);
    }
    calculateRentDueBookingsPerContract(today, contract, latestRentDueBookingDate) {
        const result = [];
        if (!latestRentDueBookingDate) {
            latestRentDueBookingDate = contract.start;
        }
        let nextPossibleRentDueDate = this.nextPossibleRentDueDate(latestRentDueBookingDate, contract);
        while (nextPossibleRentDueDate < this.min(contract.end, today)) {
            result.push(this.createBooking(nextPossibleRentDueDate, contract));
            nextPossibleRentDueDate = this.nextPossibleRentDueDate(nextPossibleRentDueDate, contract);
        }
        return result;
    }
    createBooking(nextRentDueDate, contract) {
        return new models_1.Booking({
            clientId: contract.clientId,
            tenantId: contract.tenantId,
            contractId: contract.id,
            date: nextRentDueDate,
            comment: 'Rent',
            amount: contract.amount * -1,
            type: models_1.BookingType.RENT_DUE,
        });
    }
    nextPossibleRentDueDate(latestRentDueDate, contract) {
        return new Date(latestRentDueDate.getFullYear(), latestRentDueDate.getMonth() + contract.rentDueEveryMonth, contract.rentDueDayOfMonth);
    }
    min(day1, day2) {
        if (!day1 || !day2) {
            return !day1 ? day2 : day1;
        }
        return day1 < day2 ? day1 : day2;
    }
}
exports.RentDueCalculationService = RentDueCalculationService;
//# sourceMappingURL=rentdue.calculation.service.js.map
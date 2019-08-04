"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testlab_1 = require("@loopback/testlab");
const models_1 = require("../../../../models");
const latest_rent_due_booking_1 = require("../../../../services/rentdue/latest.rent.due.booking");
const rentdue_calculation_service_1 = require("../../../../services/rentdue/rentdue.calculation.service");
describe('RentDueCalculationService Unit Tests', () => {
    let rentDueCalculationService;
    beforeEach('setup service and database', async () => {
        rentDueCalculationService = new rentdue_calculation_service_1.RentDueCalculationService();
    });
    after(async () => { });
    it('should create a due booking for current month after the due date', async function () {
        // given
        const clientId = 1;
        const tenantId = 2;
        const contract1 = new models_1.Contract({
            id: 1,
            clientId: clientId,
            tenantId: tenantId,
            start: new Date(2017, 0, 1),
            rentDueEveryMonth: 1,
            rentDueDayOfMonth: 10,
            amount: 1000,
        });
        // when
        const bookings = await rentDueCalculationService.calculateRentDueBookings(new Date(2019, 3, 11), [new latest_rent_due_booking_1.LatestRentDueBooking(contract1, new Date(2019, 2, 10))]);
        // then
        testlab_1.expect(bookings).length(1);
        testlab_1.expect(bookings[0].clientId).to.eql(clientId);
        testlab_1.expect(bookings[0].tenantId).to.eql(contract1.tenantId);
        testlab_1.expect(bookings[0].contractId).to.eql(contract1.id);
        testlab_1.expect(bookings[0].date).to.eql(new Date(2019, 3, 10));
        testlab_1.expect(bookings[0].comment).to.eql('Rent');
        testlab_1.expect(bookings[0].amount).to.eql(-1000);
        testlab_1.expect(bookings[0].type).to.eql(models_1.BookingType.RENT_DUE);
    });
    it('should not create a due booking for current month on the due date', async function () {
        // given
        const clientId = 1;
        const tenantId = 2;
        const contract1 = new models_1.Contract({
            id: 1,
            clientId: clientId,
            tenantId: tenantId,
            start: new Date(2017, 0, 1),
            rentDueEveryMonth: 1,
            rentDueDayOfMonth: 10,
            amount: 1000,
        });
        // when
        const bookings = await rentDueCalculationService.calculateRentDueBookings(new Date(2019, 3, 10), [new latest_rent_due_booking_1.LatestRentDueBooking(contract1, new Date(2019, 2, 10))]);
        // then
        testlab_1.expect(bookings).length(0);
    });
    it('should create due bookings from start month', async function () {
        // given
        const clientId = 1;
        const tenantId = 2;
        const contract1 = new models_1.Contract({
            id: 1,
            clientId: clientId,
            tenantId: tenantId,
            start: new Date(2018, 0, 1),
            rentDueEveryMonth: 1,
            rentDueDayOfMonth: 8,
            amount: 1000,
        });
        // when
        const bookings = await rentDueCalculationService.calculateRentDueBookings(new Date(2019, 3, 15), [new latest_rent_due_booking_1.LatestRentDueBooking(contract1)]);
        // then
        testlab_1.expect(bookings).length(15);
        testlab_1.expect(bookings[0].clientId).to.eql(clientId);
        testlab_1.expect(bookings[0].tenantId).to.eql(contract1.tenantId);
        testlab_1.expect(bookings[0].contractId).to.eql(contract1.id);
        testlab_1.expect(bookings[0].date).to.eql(new Date(2018, 1, 8));
        testlab_1.expect(bookings[0].comment).to.eql('Rent');
        testlab_1.expect(bookings[0].amount).to.eql(-1000);
        testlab_1.expect(bookings[0].type).to.eql(models_1.BookingType.RENT_DUE);
        testlab_1.expect(bookings[1].clientId).to.eql(clientId);
        testlab_1.expect(bookings[1].tenantId).to.eql(contract1.tenantId);
        testlab_1.expect(bookings[1].contractId).to.eql(contract1.id);
        testlab_1.expect(bookings[1].date).to.eql(new Date(2018, 2, 8));
        testlab_1.expect(bookings[1].comment).to.eql('Rent');
        testlab_1.expect(bookings[1].amount).to.eql(-1000);
        testlab_1.expect(bookings[1].type).to.eql(models_1.BookingType.RENT_DUE);
        testlab_1.expect(bookings[14].clientId).to.eql(clientId);
        testlab_1.expect(bookings[14].tenantId).to.eql(contract1.tenantId);
        testlab_1.expect(bookings[14].contractId).to.eql(contract1.id);
        testlab_1.expect(bookings[14].date).to.eql(new Date(2019, 3, 8));
        testlab_1.expect(bookings[14].comment).to.eql('Rent');
        testlab_1.expect(bookings[14].amount).to.eql(-1000);
        testlab_1.expect(bookings[14].type).to.eql(models_1.BookingType.RENT_DUE);
    });
    it('should not create a due booking for current month if the due date is not reached', async function () {
        // given
        const clientId = 1;
        const tenantId = 2;
        const contract1 = new models_1.Contract({
            id: 1,
            clientId: clientId,
            tenantId: tenantId,
            start: new Date(2017, 0, 1),
            rentDueEveryMonth: 1,
            rentDueDayOfMonth: 10,
            amount: 1000,
        });
        // when
        const bookings = await rentDueCalculationService.calculateRentDueBookings(new Date(2019, 3, 9), [new latest_rent_due_booking_1.LatestRentDueBooking(contract1, new Date(2019, 2, 10))]);
        // then
        testlab_1.expect(bookings).length(0);
    });
});
//# sourceMappingURL=rentdue.service.unit.js.map
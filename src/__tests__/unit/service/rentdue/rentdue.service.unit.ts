import {expect} from '@loopback/testlab';
import {Booking, BookingType, Contract} from '../../../../models';
import {LatestRentDueBooking} from '../../../../services/rentdue/latest.rent.due.booking';
import {RentDueCalculationService} from '../../../../services/rentdue/rentdue.calculation.service';

describe('RentDueCalculationService Unit Tests', () => {
  let rentDueCalculationService: RentDueCalculationService;

  beforeEach('setup service and database', async () => {
    rentDueCalculationService = new RentDueCalculationService();
  });

  after(async () => {});

  it('should create a due booking for current month after the due date', async function() {
    // given
    const clientId = 1;
    const tenantId = 2;
    const contract1 = new Contract({
      id: 1,
      clientId: clientId,
      tenantId: tenantId,
      start: new Date(2017, 0, 1),
      rentDueEveryMonth: 1,
      rentDueDayOfMonth: 10,
      amount: 1000,
    });

    // when
    const bookings: Booking[] = await rentDueCalculationService.calculateRentDueBookings(
      new Date(2019, 3, 11),
      [new LatestRentDueBooking(contract1, new Date(2019, 2, 10))],
    );

    // then
    expect(bookings).length(1);
    expect(bookings[0].clientId).to.eql(clientId);
    expect(bookings[0].tenantId).to.eql(contract1.tenantId);
    expect(bookings[0].contractId).to.eql(contract1.id);
    expect(bookings[0].date).to.eql(new Date(2019, 3, 10));
    expect(bookings[0].comment).to.eql('Rent');
    expect(bookings[0].amount).to.eql(-1000);
    expect(bookings[0].type).to.eql(BookingType.RENT_DUE);
  });

  it('should not create a due booking for current month on the due date', async function() {
    // given
    const clientId = 1;
    const tenantId = 2;
    const contract1 = new Contract({
      id: 1,
      clientId: clientId,
      tenantId: tenantId,
      start: new Date(2017, 0, 1),
      rentDueEveryMonth: 1,
      rentDueDayOfMonth: 10,
      amount: 1000,
    });

    // when
    const bookings: Booking[] = await rentDueCalculationService.calculateRentDueBookings(
      new Date(2019, 3, 10),
      [new LatestRentDueBooking(contract1, new Date(2019, 2, 10))],
    );

    // then
    expect(bookings).length(0);
  });

  it('should create due bookings from start month', async function() {
    // given
    const clientId = 1;
    const tenantId = 2;
    const contract1 = new Contract({
      id: 1,
      clientId: clientId,
      tenantId: tenantId,
      start: new Date(2018, 0, 1),
      rentDueEveryMonth: 1,
      rentDueDayOfMonth: 8,
      amount: 1000,
    });

    // when
    const bookings: Booking[] = await rentDueCalculationService.calculateRentDueBookings(
      new Date(2019, 3, 15),
      [new LatestRentDueBooking(contract1)],
    );

    // then
    expect(bookings).length(15);
    expect(bookings[0].clientId).to.eql(clientId);
    expect(bookings[0].tenantId).to.eql(contract1.tenantId);
    expect(bookings[0].contractId).to.eql(contract1.id);
    expect(bookings[0].date).to.eql(new Date(2018, 1, 8));
    expect(bookings[0].comment).to.eql('Rent');
    expect(bookings[0].amount).to.eql(-1000);
    expect(bookings[0].type).to.eql(BookingType.RENT_DUE);

    expect(bookings[1].clientId).to.eql(clientId);
    expect(bookings[1].tenantId).to.eql(contract1.tenantId);
    expect(bookings[1].contractId).to.eql(contract1.id);
    expect(bookings[1].date).to.eql(new Date(2018, 2, 8));
    expect(bookings[1].comment).to.eql('Rent');
    expect(bookings[1].amount).to.eql(-1000);
    expect(bookings[1].type).to.eql(BookingType.RENT_DUE);

    expect(bookings[14].clientId).to.eql(clientId);
    expect(bookings[14].tenantId).to.eql(contract1.tenantId);
    expect(bookings[14].contractId).to.eql(contract1.id);
    expect(bookings[14].date).to.eql(new Date(2019, 3, 8));
    expect(bookings[14].comment).to.eql('Rent');
    expect(bookings[14].amount).to.eql(-1000);
    expect(bookings[14].type).to.eql(BookingType.RENT_DUE);
  });

  it('should not create a due booking for current month if the due date is not reached', async function() {
    // given
    const clientId = 1;
    const tenantId = 2;
    const contract1 = new Contract({
      id: 1,
      clientId: clientId,
      tenantId: tenantId,
      start: new Date(2017, 0, 1),
      rentDueEveryMonth: 1,
      rentDueDayOfMonth: 10,
      amount: 1000,
    });

    // when
    const bookings: Booking[] = await rentDueCalculationService.calculateRentDueBookings(
      new Date(2019, 3, 9),
      [new LatestRentDueBooking(contract1, new Date(2019, 2, 10))],
    );

    // then
    expect(bookings).length(0);
  });
});

import {expect} from '@loopback/testlab';
import {Booking, BookingType, Debitor} from '../../../../models';
import {LatestRentDueBooking} from '../../../../services/rentdue/latest.rent.due.booking';
import {RentDueCalculationService} from '../../../../services/rentdue/rentdue.calculation.service';

describe('RentDueCalculationService Unit Tests', () => {
  let rentDueCalculationService: RentDueCalculationService;

  beforeEach('setup service and database', async () => {
    rentDueCalculationService = new RentDueCalculationService();
  });

  after(async () => {});

  it('should create due booking for current month', async function() {
    // given
    const clientId = 1;
    const debitor1 = new Debitor({
      id: 1,
      clientId: clientId,
      name: 'Test Debitor 1',
      start: new Date(2017, 0, 1),
      rentDueEveryMonth: 1,
      rentDueDayOfMonth: 10,
      amount: 1000,
    });

    // when
    const bookings: Booking[] = await rentDueCalculationService.calculateRentDueBookings(
      new Date(2019, 3, 15),
      [new LatestRentDueBooking(debitor1, new Date(2019, 2, 10))],
    );

    // then
    expect(bookings).length(1);
    expect(bookings[0].clientId).to.eql(clientId);
    expect(bookings[0].debitorId).to.eql(debitor1.id);
    expect(bookings[0].date).to.eql(new Date(2019, 3, 10));
    expect(bookings[0].amount).to.eql(-1000);
    expect(bookings[0].type).to.eql(BookingType.RENT_DUE);
  });
});

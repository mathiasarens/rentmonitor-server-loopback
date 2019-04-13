import {Booking, BookingType, Debitor} from '../../models';
import {LatestRentDueBooking} from './latest.rent.due.booking';

export class RentDueCalculationService {
  public async calculateRentDueBookings(
    today: Date,
    latestRentDueBookingsPerDebitor: LatestRentDueBooking[],
  ): Promise<Booking[]> {
    let result: Booking[] = new Array();
    for (let latestRentDueBooking of latestRentDueBookingsPerDebitor) {
      const booking: Booking[] = this.calculateRentDueBookingsPerDebitor(
        today,
        latestRentDueBooking.debitor,
        latestRentDueBooking.bookingDate,
      );
      result = result.concat([], booking);
    }
    return Promise.resolve(result);
  }

  private calculateRentDueBookingsPerDebitor(
    today: Date,
    debitor: Debitor,
    latestRentDueBookingDate?: Date,
  ): Booking[] {
    const result: Booking[] = [];
    if (!latestRentDueBookingDate) {
      latestRentDueBookingDate = debitor.start as Date;
    }
    let nextPossibleRentDueDate = this.nextPossibleRentDueDate(
      latestRentDueBookingDate,
      debitor,
    );
    while (nextPossibleRentDueDate < this.min(debitor.end, today)) {
      result.push(this.createBooking(nextPossibleRentDueDate, debitor));
      nextPossibleRentDueDate = this.nextPossibleRentDueDate(
        nextPossibleRentDueDate,
        debitor,
      );
    }
    return result;
  }

  private createBooking(nextRentDueDate: Date, debitor: Debitor): Booking {
    return new Booking({
      clientId: debitor.clientId,
      debitorId: debitor.id,
      date: nextRentDueDate,
      comment: 'Rent',
      amount: debitor.amount! * -1,
      type: BookingType.RENT_DUE,
    });
  }

  private nextPossibleRentDueDate(
    latestRentDueDate: Date,
    debitor: Debitor,
  ): Date {
    return new Date(
      latestRentDueDate.getFullYear(),
      latestRentDueDate.getMonth() + debitor.rentDueEveryMonth!,
      debitor.rentDueDayOfMonth,
    );
  }

  private min(day1: Date | undefined, day2: Date | undefined): Date {
    if (!day1 || !day2) {
      return !day1 ? day2! : day1;
    }
    return day1 < day2 ? day1 : day2;
  }
}

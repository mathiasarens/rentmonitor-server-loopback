import {Booking, BookingType, Contract} from '../../models';
import {LatestRentDueBooking} from './latest.rent.due.booking';

export class RentDueCalculationService {
  public async calculateRentDueBookings(
    today: Date,
    latestRentDueBookingsPerTenant: LatestRentDueBooking[],
  ): Promise<Booking[]> {
    let result: Booking[] = new Array();
    for (let latestRentDueBooking of latestRentDueBookingsPerTenant) {
      const booking: Booking[] = this.calculateRentDueBookingsPerContract(
        today,
        latestRentDueBooking.contract,
        latestRentDueBooking.bookingDate,
      );
      result = result.concat([], booking);
    }
    return Promise.resolve(result);
  }

  private calculateRentDueBookingsPerContract(
    today: Date,
    contract: Contract,
    latestRentDueBookingDate?: Date,
  ): Booking[] {
    const result: Booking[] = [];
    if (!latestRentDueBookingDate) {
      latestRentDueBookingDate = contract.start as Date;
    }
    let nextPossibleRentDueDate = this.nextPossibleRentDueDate(
      latestRentDueBookingDate,
      contract,
    );
    while (nextPossibleRentDueDate < this.min(contract.end, today)) {
      result.push(this.createBooking(nextPossibleRentDueDate, contract));
      nextPossibleRentDueDate = this.nextPossibleRentDueDate(
        nextPossibleRentDueDate,
        contract,
      );
    }
    return result;
  }

  private createBooking(nextRentDueDate: Date, contract: Contract): Booking {
    return new Booking({
      clientId: contract.clientId,
      tenantId: contract.tenantId,
      contractId: contract.id,
      date: nextRentDueDate,
      comment: 'Rent',
      amount: contract.amount! * -1,
      type: BookingType.RENT_DUE,
    });
  }

  private nextPossibleRentDueDate(
    latestRentDueDate: Date,
    contract: Contract,
  ): Date {
    return new Date(
      latestRentDueDate.getFullYear(),
      latestRentDueDate.getMonth() + contract.rentDueEveryMonth!,
      contract.rentDueDayOfMonth,
    );
  }

  private min(day1: Date | undefined, day2: Date | undefined): Date {
    if (!day1 || !day2) {
      return !day1 ? day2! : day1;
    }
    return day1 < day2 ? day1 : day2;
  }
}

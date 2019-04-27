import {Contract} from '../../models';

export class LatestRentDueBooking {
  constructor(public contract: Contract, public bookingDate?: Date) {}
}

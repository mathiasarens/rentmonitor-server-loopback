import {Debitor} from '../../models';

export class LatestRentDueBooking {
  constructor(public debitor: Debitor, public bookingDate?: Date) {}
}

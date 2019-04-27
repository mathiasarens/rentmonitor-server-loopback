import {repository} from '@loopback/repository';
import {AccountTransaction} from '../../models';
import {BookingRepository} from '../../repositories';

export class AccountSynchronisationBookingService {
  constructor(
    @repository(BookingRepository)
    private bookingRepository: BookingRepository,
  ) {}

  public async createAndSaveBookings(
    accountTransactions: AccountTransaction[],
  ) {}
}

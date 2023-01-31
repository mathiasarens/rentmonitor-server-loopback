import {BindingKey} from '@loopback/context';
import {repository} from '@loopback/repository';
import {AccountTransaction, Booking, BookingType, Contract} from '../../models';
import {BookingRepository, ContractRepository} from '../../repositories';

export class AccountSynchronisationBookingService {
  constructor(
    @repository(ContractRepository)
    private contractRepository: ContractRepository,
    @repository(BookingRepository)
    private bookingRepository: BookingRepository,
  ) {}

  public async createAndSaveNewBookings(
    clientId: number,
    newAccountTransactions: AccountTransaction[],
    now: Date,
  ): Promise<[Booking[], AccountTransaction[]]> {
    const contracts: Contract[] =
      await this.contractRepository.findActiveContracts(clientId, now);
    return this.createAndSaveBookingsByContracts(
      clientId,
      newAccountTransactions,
      contracts,
      now,
    );
  }

  private async createAndSaveBookingsByContracts(
    clientId: number,
    accountTransactions: AccountTransaction[],
    contracts: Contract[],
    now: Date,
  ): Promise<[Booking[], AccountTransaction[]]> {
    const unmachtedAccountTransactions: AccountTransaction[] = [];
    const bookings: Booking[] = [];
    for (const accountTransaction of accountTransactions) {
      // filter account transactions that were linked to a booking already
      const bookingExists = await this.isBookingLinkedToAccountTransaction(
        clientId,
        accountTransaction,
      );
      let matched = false;
      if (!bookingExists) {
        for (const contract of contracts) {
          if (
            this.matchAccountTransactionAndContract(
              accountTransaction,
              contract,
            )
          ) {
            const booking = this.createBookingFromAccountTransactionAndContract(
              accountTransaction,
              contract,
            );
            const bookingFromDb = await this.bookingRepository.create(booking);
            bookings.push(bookingFromDb);
            matched = true;
            break;
          }
        }
      }
      if (!matched) {
        unmachtedAccountTransactions.push(accountTransaction);
      }
    }
    return [bookings, unmachtedAccountTransactions];
  }

  private async isBookingLinkedToAccountTransaction(
    clientId: number,
    accountTransaction: AccountTransaction,
  ): Promise<boolean> {
    const bookingListForAccountTransaction = await this.bookingRepository.find({
      where: {
        clientId: clientId,
        accountTransactionId: accountTransaction.id,
      },
    });
    return bookingListForAccountTransaction.length > 0;
  }

  private matchAccountTransactionAndContract(
    accountTransaction: AccountTransaction,
    contract: Contract,
  ): boolean {
    return contract.accountSynchronisationName === accountTransaction.name;
  }

  private createBookingFromAccountTransactionAndContract(
    accountTransaction: AccountTransaction,
    contract: Contract,
  ): Booking {
    return new Booking({
      clientId: contract.clientId,
      tenantId: contract.tenantId,
      date: accountTransaction.date,
      comment: accountTransaction.text,
      amount: accountTransaction.amount,
      type: BookingType.RENT_PAID_ALGO,
      accountTransactionId: accountTransaction.id,
    });
  }
}

export namespace AccountSynchronisationBookingServiceBindings {
  export const SERVICE =
    BindingKey.create<AccountSynchronisationBookingService>(
      'services.accountsynchronisationbooking.service',
    );
}

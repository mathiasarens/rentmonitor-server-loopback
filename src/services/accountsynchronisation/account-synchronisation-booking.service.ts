import {repository} from '@loopback/repository';
import {AccountTransaction, Booking, BookingType, Contract} from '../../models';
import {
  AccountTransactionRepository,
  BookingRepository,
  ContractRepository,
} from '../../repositories';

export class AccountSynchronisationBookingService {
  constructor(
    @repository(ContractRepository)
    private contractRepository: ContractRepository,
    @repository(BookingRepository)
    private bookingRepository: BookingRepository,
    @repository(AccountTransactionRepository)
    private accountTransactionRepository: AccountTransactionRepository,
  ) {}

  public async createAndSaveBookings(
    clientId: number,
    accountTransactions: AccountTransaction[],
    now: Date,
  ): Promise<[Booking[], AccountTransaction[]]> {
    const activeContracts: Contract[] = await this.contractRepository.findActiveContracts(
      clientId,
      now,
    );
    return this.createAndSaveBookingsByContracts(
      accountTransactions,
      activeContracts,
      now,
    );
  }

  private async createAndSaveBookingsByContracts(
    accountTransactions: AccountTransaction[],
    activeContracts: Contract[],
    now: Date,
  ): Promise<[Booking[], AccountTransaction[]]> {
    let unmachtedAccountTransactions: AccountTransaction[] = [];
    let bookings: Booking[] = [];
    for (let accountTransaction of accountTransactions) {
      let matched = false;
      for (let contract of activeContracts) {
        if (
          this.matchAccountTransactionAndContract(accountTransaction, contract)
        ) {
          const booking = this.createBookingFromAccountTransactionAndContract(
            accountTransaction,
            contract,
          );
          const bookingFromDb = await this.bookingRepository.create(booking);
          accountTransaction.bookingId = bookingFromDb.id;
          await this.accountTransactionRepository.update(accountTransaction);
          bookings.push(bookingFromDb);
          matched = true;
          break;
        }
      }
      if (!matched) {
        unmachtedAccountTransactions.push(accountTransaction);
      }
    }
    return [bookings, unmachtedAccountTransactions];
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
      contractId: contract.id,
      date: accountTransaction.date,
      comment: accountTransaction.text,
      amount: accountTransaction.amount,
      type: BookingType.RENT_DUE,
      accountTransactionId: accountTransaction.id,
    });
  }
}

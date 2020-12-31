import {BindingKey} from '@loopback/context';
import {repository} from '@loopback/repository';
import {AccountTransaction, Booking, BookingType, Tenant} from '../../models';
import {BookingRepository, TenantRepository} from '../../repositories';

export class AccountSynchronisationBookingService {
  constructor(
    @repository(TenantRepository)
    private tenantRepository: TenantRepository,
    @repository(BookingRepository)
    private bookingRepository: BookingRepository,
  ) {}

  public async createAndSaveNewBookings(
    clientId: number,
    newAccountTransactions: AccountTransaction[],
    now: Date,
  ): Promise<[Booking[], AccountTransaction[]]> {
    const tenants: Tenant[] = await this.tenantRepository.find();
    return this.createAndSaveBookingsByContracts(
      clientId,
      newAccountTransactions,
      tenants,
      now,
    );
  }

  private async createAndSaveBookingsByContracts(
    clientId: number,
    accountTransactions: AccountTransaction[],
    tenants: Tenant[],
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
        for (const tenant of tenants) {
          if (
            this.matchAccountTransactionAndContract(accountTransaction, tenant)
          ) {
            const booking = this.createBookingFromAccountTransactionAndTenant(
              accountTransaction,
              tenant,
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
    tenant: Tenant,
  ): boolean {
    return tenant.accountSynchronisationName === accountTransaction.name;
  }

  private createBookingFromAccountTransactionAndTenant(
    accountTransaction: AccountTransaction,
    tenant: Tenant,
  ): Booking {
    return new Booking({
      clientId: tenant.clientId,
      tenantId: tenant.id,
      date: accountTransaction.date,
      comment: accountTransaction.text,
      amount: accountTransaction.amount,
      type: BookingType.RENT_PAID_ALGO,
      accountTransactionId: accountTransaction.id,
    });
  }
}

export namespace AccountSynchronisationBookingServiceBindings {
  export const SERVICE = BindingKey.create<AccountSynchronisationBookingService>(
    'services.accountsynchronisationbooking.service',
  );
}

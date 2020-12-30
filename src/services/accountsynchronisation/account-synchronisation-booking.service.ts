import {BindingKey} from '@loopback/context';
import {repository} from '@loopback/repository';
import {AccountTransaction, Booking, BookingType, Tenant} from '../../models';
import {
  AccountTransactionRepository,
  BookingRepository,
  TenantRepository,
} from '../../repositories';

export class AccountSynchronisationBookingService {
  constructor(
    @repository(TenantRepository)
    private tenantRepository: TenantRepository,
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
    const tenants: Tenant[] = await this.tenantRepository.find();
    return this.createAndSaveBookingsByContracts(
      accountTransactions,
      tenants,
      now,
    );
  }

  private async createAndSaveBookingsByContracts(
    accountTransactions: AccountTransaction[],
    tenants: Tenant[],
    now: Date,
  ): Promise<[Booking[], AccountTransaction[]]> {
    const unmachtedAccountTransactions: AccountTransaction[] = [];
    const bookings: Booking[] = [];
    for (const accountTransaction of accountTransactions) {
      let matched = false;
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
      if (!matched) {
        unmachtedAccountTransactions.push(accountTransaction);
      }
    }
    return [bookings, unmachtedAccountTransactions];
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

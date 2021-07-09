import {BindingKey, inject} from '@loopback/core';
import {repository, WhereBuilder} from '@loopback/repository';
import {AccountTransaction} from '../../models';
import {AccountTransactionRepository} from '../../repositories';
import {
  AccountSynchronisationBookingService,
  AccountSynchronisationBookingServiceBindings,
} from './account-synchronisation-booking.service';

export class TransactionToBookingResult {
  constructor(
    public newBookings: number,
    public unmatchedTransactions: number,
    public error?: string,
  ) {}
}
export class TransactionToBookingService {
  constructor(
    @repository(AccountTransactionRepository)
    private accountTransactionRepository: AccountTransactionRepository,
    @inject(AccountSynchronisationBookingServiceBindings.SERVICE)
    private accountSynchronisationBookingService: AccountSynchronisationBookingService,
  ) {}

  public async createAndSaveBookingsForUnmatchedAccountTransactions(
    now: Date,
    clientId: number,
    from?: Date,
    to?: Date,
  ): Promise<TransactionToBookingResult> {
    const existingAccountTransactions = await this.loadExistingTransactions(
      clientId,
      from,
      to,
    );

    const [newBookings, unmatchedAccountTransactions] =
      await this.accountSynchronisationBookingService.createAndSaveNewBookings(
        clientId,
        existingAccountTransactions,
        now,
      );

    return new TransactionToBookingResult(
      newBookings.length,
      unmatchedAccountTransactions.length,
    );
  }

  private async loadExistingTransactions(
    clientId: number,
    from: Date | undefined,
    to: Date | undefined,
  ): Promise<AccountTransaction[]> {
    const whereBuilder = new WhereBuilder();
    whereBuilder.eq('clientId', clientId);
    if (from) {
      whereBuilder.and({date: {gte: from}});
      if (to) {
        whereBuilder.and({date: {lt: to}});
      }
    }
    return this.accountTransactionRepository.find({
      where: whereBuilder.build(),
    });
  }
}

export namespace TransactionToBookingServiceBindings {
  export const SERVICE = BindingKey.create<TransactionToBookingService>(
    'services.transactiontobooking.service',
  );
}

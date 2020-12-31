import {BindingKey, inject} from '@loopback/core';
import {repository, WhereBuilder} from '@loopback/repository';
import {AccountTransaction} from '../../models';
import {AccountTransactionRepository} from '../../repositories';
import {
  AccountSynchronisationBookingService,
  AccountSynchronisationBookingServiceBindings,
} from './account-synchronisation-booking.service';

export class TransactionSynchronisationResult {
  constructor(
    public newBookings: number,
    public unmatchedTransactions: number,
    public error?: string,
  ) {}
}
export class TransactionSynchronisationService {
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
  ): Promise<TransactionSynchronisationResult> {
    const existingAccountTransactions = await this.loadExistingTransactions(
      clientId,
      from,
      to,
    );

    const [
      newBookings,
      unmatchedAccountTransactions,
    ] = await this.accountSynchronisationBookingService.createAndSaveNewBookings(
      clientId,
      existingAccountTransactions,
      now,
    );

    return new TransactionSynchronisationResult(
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
      whereBuilder.and({gte: {date: from}});
      if (to) {
        whereBuilder.and({lte: {date: to}});
      }
    }
    return await this.accountTransactionRepository.find({
      where: whereBuilder.build(),
    });
  }
}

export namespace TransactionSynchronisationServiceBindings {
  export const SERVICE = BindingKey.create<TransactionSynchronisationService>(
    'services.transactionsynchronisation.service',
  );
}

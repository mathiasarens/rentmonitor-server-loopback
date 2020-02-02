import {BindingKey, inject} from '@loopback/core';
import {repository} from '@loopback/repository';
import {
  AccountSettings,
  AccountTransaction,
  AccountTransactionLog,
} from '../../models';
import {AccountSettingsRepository} from '../../repositories';
import {AccountTransactionLogRepository} from '../../repositories/account-transaction-log.repository';
import {
  AccountSynchronisationBookingService,
  AccountSynchronisationBookingServiceBindings,
} from './account-synchronisation-booking.service';
import {
  AccountSynchronisationTransactionService,
  AccountSynchronisationTransactionServiceBindings,
} from './account-synchronisation-transaction.service';
import {FinTsAccountTransactionDTO, FintsService} from './fints.service';
import {FintsServiceBindings} from './fints.service.impl';

export class AccountSynchronisationResult {
  constructor(
    public accountId: number,
    public accountName: string,
    public newBookings: number,
    public unmatchedTransactions: number,
    public error?: string,
  ) {}
}
export class AccountSynchronisationService {
  constructor(
    @repository(AccountSettingsRepository)
    private accountSettingsRepository: AccountSettingsRepository,
    @repository(AccountTransactionLogRepository)
    private accountTransactionLogRepository: AccountTransactionLogRepository,
    @inject(FintsServiceBindings.SERVICE)
    private fintsAccountTransactionSynchronization: FintsService,
    @inject(AccountSynchronisationTransactionServiceBindings.SERVICE)
    private accountSynchronisationSaveService: AccountSynchronisationTransactionService,
    @inject(AccountSynchronisationBookingServiceBindings.SERVICE)
    private accountSynchronisationBookingService: AccountSynchronisationBookingService,
  ) {}

  public async retrieveAndSaveNewAccountTransactionsAndCreateNewBookingsForAllAccounts(
    now: Date,
    clientId: number,
    from?: Date,
    to?: Date,
  ): Promise<AccountSynchronisationResult[]> {
    const accountSettingsList: AccountSettings[] = await this.accountSettingsRepository.find(
      {where: {clientId: clientId}},
    );
    const accountSynchronisationResults: AccountSynchronisationResult[] = [];
    for (const accountSettings of accountSettingsList) {
      try {
        const newTransactions = await this.retrieveAndSaveNewAccountTransactions(
          now,
          accountSettings,
          from,
          to,
        );
        const [
          newBookings,
          unmatchedAccountTransactions,
        ] = await this.accountSynchronisationBookingService.createAndSaveBookings(
          clientId,
          newTransactions,
          now,
        );
        accountSynchronisationResults.push(
          new AccountSynchronisationResult(
            accountSettings.id,
            accountSettings.name,
            newBookings.length,
            unmatchedAccountTransactions.length,
          ),
        );
      } catch (error) {
        console.error(error);
        accountSynchronisationResults.push(
          new AccountSynchronisationResult(
            accountSettings.id,
            accountSettings.name,
            0,
            0,
            error,
          ),
        );
      }
    }
    return accountSynchronisationResults;
  }

  public async retrieveAndSaveNewAccountTransactionsAndCreateNewBookingsForASingleAccount(
    now: Date,
    clientId: number,
    accountId: number,
    from?: Date,
    to?: Date,
    transactionReference?: string,
    tan?: string,
  ): Promise<AccountSynchronisationResult> {
    const accountSettings = await this.accountSettingsRepository.findOne({
      where: {clientId: clientId, id: accountId},
    });
    if (accountSettings) {
      const newTransactions = await this.retrieveAndSaveNewAccountTransactions(
        now,
        accountSettings!,
        from,
        to,
        transactionReference,
        tan,
      );
      const [
        newBookings,
        unmatchedAccountTransactions,
      ] = await this.accountSynchronisationBookingService.createAndSaveBookings(
        clientId,
        newTransactions,
        now,
      );
      return new AccountSynchronisationResult(
        accountSettings!.id,
        accountSettings!.name,
        newBookings.length,
        unmatchedAccountTransactions.length,
      );
    } else {
      throw new Error('Account Id not found: ' + accountId);
    }
  }

  private async retrieveAndSaveNewAccountTransactions(
    now: Date,
    accountSettings: AccountSettings,
    from?: Date,
    to?: Date,
    transactionReference?: string,
    tan?: string,
  ): Promise<AccountTransaction[]> {
    const rawAccountTransactions: FinTsAccountTransactionDTO[] = await this.fintsAccountTransactionSynchronization.fetchStatements(
      accountSettings.fintsBlz!,
      accountSettings.fintsUrl!,
      accountSettings.fintsUser!,
      accountSettings.fintsPassword!,
      accountSettings.rawAccount,
      from,
      to,
      transactionReference,
      tan,
    );
    await this.logAccountTransactions(
      now,
      accountSettings,
      rawAccountTransactions,
    );
    const accountTransactions: AccountTransaction[] = rawAccountTransactions.map(
      at => this.convertToAccountTransaction(accountSettings, at),
    );
    const newAccountTransactions = await this.accountSynchronisationSaveService.saveNewAccountTransactions(
      accountSettings,
      accountTransactions,
    );

    return newAccountTransactions;
  }

  private convertToAccountTransaction(
    accountSettings: AccountSettings,
    rawAccountTransaction: FinTsAccountTransactionDTO,
  ): AccountTransaction {
    return new AccountTransaction({
      clientId: accountSettings.clientId,
      accountSettingsId: accountSettings.id,
      date: rawAccountTransaction.date,
      name: rawAccountTransaction.name,
      bic: rawAccountTransaction.bic,
      iban: rawAccountTransaction.iban,
      text: rawAccountTransaction.text,
      amount: rawAccountTransaction.value,
    });
  }

  private async logAccountTransactions(
    now: Date,
    accountSettings: AccountSettings,
    rawAccountTransactions: FinTsAccountTransactionDTO[],
  ) {
    const accountTransactionsToSave: AccountTransactionLog[] = rawAccountTransactions.map(
      at =>
        new AccountTransactionLog({
          clientId: accountSettings.clientId,
          accountSettingsId: accountSettings.id,
          time: now,
          rawstring: at.rawstring,
        }),
    );
    await this.accountTransactionLogRepository.createAll(
      accountTransactionsToSave,
    );
  }
}

export namespace AccountSynchronisationServiceBindings {
  export const SERVICE = BindingKey.create<AccountSynchronisationService>(
    'services.accountsynchronisation.service',
  );
}

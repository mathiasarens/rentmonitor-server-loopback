import {BindingKey, inject} from '@loopback/core';
import {repository} from '@loopback/repository';
import {
  AccountSettings,
  AccountTransaction,
  AccountTransactionLog,
  Booking,
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
    public accountSettingsId: number,
    public accountName: string,
    public newBookings: Booking[],
    public unmatchedTransactions: AccountTransaction[],
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
    const accountSettingsList: AccountSettings[] =
      await this.accountSettingsRepository.find({where: {clientId: clientId}});
    const accountSynchronisationResults: AccountSynchronisationResult[] = [];
    for (const accountSettings of accountSettingsList) {
      try {
        const result =
          await this.retrieveAndSaveNewAccountTransactionsAndCreateNewBookingsForASingleAccount(
            now,
            clientId,
            accountSettings.id,
            from,
            to,
          );
        accountSynchronisationResults.push(result);
      } catch (error) {
        console.error(error);
        accountSynchronisationResults.push(
          new AccountSynchronisationResult(
            accountSettings.id,
            accountSettings.name,
            [],
            [],
          ),
        );
      }
    }
    return accountSynchronisationResults;
  }

  public async retrieveAndSaveNewAccountTransactionsAndCreateNewBookingsForASingleAccount(
    now: Date,
    clientId: number,
    accountSettingsId: number,
    from?: Date,
    to?: Date,
    tan?: string,
  ): Promise<AccountSynchronisationResult> {
    const accountSettings = await this.accountSettingsRepository.findOne({
      where: {clientId: clientId, id: accountSettingsId},
    });
    if (accountSettings) {
      const newTransactions = await this.retrieveAndSaveNewAccountTransactions(
        now,
        accountSettings!,
        from,
        to,
        tan,
      );
      const [newBookings, unmatchedAccountTransactions] =
        await this.accountSynchronisationBookingService.createAndSaveNewBookings(
          clientId,
          newTransactions,
          now,
        );
      await this.clearTanRequiredErrorOnAccountSettings(accountSettings);
      return new AccountSynchronisationResult(
        accountSettings!.id,
        accountSettings!.name,
        newBookings,
        unmatchedAccountTransactions,
      );
    } else {
      throw new Error('Account Id not found: ' + accountSettingsId);
    }
  }

  private async clearTanRequiredErrorOnAccountSettings(
    accountSettings: AccountSettings,
  ) {
    accountSettings.fintsTanRequiredError = undefined;
    await this.accountSettingsRepository.update(
      new AccountSettings(accountSettings),
    );
  }

  private async retrieveAndSaveNewAccountTransactions(
    now: Date,
    accountSettings: AccountSettings,
    from?: Date,
    to?: Date,
    tan?: string,
  ): Promise<AccountTransaction[]> {
    const rawAccountTransactions: FinTsAccountTransactionDTO[] =
      await this.fintsAccountTransactionSynchronization.fetchStatements(
        accountSettings,
        from,
        to,
        tan,
      );
    await this.logAccountTransactions(
      now,
      accountSettings,
      rawAccountTransactions,
    );
    const accountTransactions: AccountTransaction[] =
      rawAccountTransactions.map(at =>
        this.convertToAccountTransaction(accountSettings, at),
      );
    const newAccountTransactions =
      await this.accountSynchronisationSaveService.saveNewAccountTransactions(
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
    const accountTransactionsToSave: AccountTransactionLog[] =
      rawAccountTransactions.map(
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

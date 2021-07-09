import {BindingKey} from '@loopback/context';
import {repository} from '@loopback/repository';
import {isNullOrUndefined} from 'util';
import {AccountSettings, AccountTransaction} from '../../models';
import {AccountTransactionRepository} from '../../repositories/account-transaction.repository';

export class AccountSynchronisationTransactionService {
  constructor(
    @repository(AccountTransactionRepository)
    private accountTransactionRepository: AccountTransactionRepository,
  ) {}

  public async saveNewAccountTransactions(
    accountSettings: AccountSettings,
    accountTransactions: AccountTransaction[],
  ): Promise<AccountTransaction[]> {
    const newAccountTransactionsAsc = accountTransactions.sort((...args) =>
      this.compareByDateIbanBicNameTextValue(...args),
    );
    const alreadySavedAccountTransactionsFromDb =
      await this.findAlreadySavedAccountTransactions(
        newAccountTransactionsAsc,
        accountSettings,
      );

    const alreadySavedAccountTransactionsFromDbAsc =
      alreadySavedAccountTransactionsFromDb.sort((...args) =>
        this.compareByDateIbanBicNameTextValue(...args),
      );

    const mergedAccountTransactions = this.merge(
      alreadySavedAccountTransactionsFromDbAsc,
      newAccountTransactionsAsc,
    );

    const mergedAccountTransactionsFromDb =
      await this.accountTransactionRepository.createAll(
        mergedAccountTransactions,
      );

    return mergedAccountTransactionsFromDb;
  }

  private merge(
    existingTransactions: AccountTransaction[],
    newTransactions: AccountTransaction[],
  ): AccountTransaction[] {
    const mergeResult = [];
    let existingTransactionsIndex = 0;
    let newTransactionsIndex = 0;
    while (
      existingTransactionsIndex < existingTransactions.length ||
      newTransactionsIndex < newTransactions.length
    ) {
      if (
        existingTransactionsIndex < existingTransactions.length &&
        newTransactionsIndex < newTransactions.length
      ) {
        const compareResult = this.compareByDateIbanBicNameTextValue(
          existingTransactions[existingTransactionsIndex],
          newTransactions[newTransactionsIndex],
        );
        if (compareResult === 0) {
          existingTransactionsIndex++;
          newTransactionsIndex++;
        } else if (compareResult < 0) {
          existingTransactionsIndex++;
        } else {
          mergeResult.push(newTransactions[newTransactionsIndex]);
          newTransactionsIndex++;
        }
      } else if (existingTransactionsIndex < existingTransactions.length) {
        existingTransactionsIndex++;
      } else if (newTransactionsIndex < newTransactions.length) {
        mergeResult.push(newTransactions[newTransactionsIndex]);
        newTransactionsIndex++;
      }
    }
    return mergeResult;
  }

  private async findAlreadySavedAccountTransactions(
    accountTransactionsInAscendingDateOrder: AccountTransaction[],
    accountSettings: AccountSettings,
  ): Promise<AccountTransaction[]> {
    const latestBookingDate: Date =
      accountTransactionsInAscendingDateOrder[0].date;
    return this.accountTransactionRepository.find({
      where: {
        clientId: accountSettings.clientId,
        accountSettingsId: accountSettings.id,
        date: {gte: latestBookingDate},
      },
    });
  }

  private compareByDateIbanBicNameTextValue(
    a: AccountTransaction,
    b: AccountTransaction,
  ): number {
    let result = this.compareDate(a.date, b.date);
    if (result !== 0) {
      return result;
    }
    result = this.compareString(a.iban, b.iban);
    if (result !== 0) {
      return result;
    }
    result = this.compareString(a.bic, b.bic);
    if (result !== 0) {
      return result;
    }
    result = this.compareString(a.name, b.name);
    if (result !== 0) {
      return result;
    }
    result = this.compareString(a.text, b.text);
    if (result !== 0) {
      return result;
    }
    result = a.amount! - b.amount!;
    return result;
  }

  private compareDate(a: Date, b: Date): number {
    if (a < b) {
      return -1;
    } else if (a > b) {
      return 1;
    } else {
      return 0;
    }
  }

  private compareString(a?: string, b?: string): number {
    if (a === b || isNullOrUndefined(a) === isNullOrUndefined(b)) {
      return 0;
    } else if (isNullOrUndefined(a) && !isNullOrUndefined(b)) {
      return -1;
    } else if (!isNullOrUndefined(a) && isNullOrUndefined(b)) {
      return 1;
    } else {
      return a!.localeCompare(b!);
    }
  }
}

export namespace AccountSynchronisationTransactionServiceBindings {
  export const SERVICE =
    BindingKey.create<AccountSynchronisationTransactionService>(
      'services.accountsynchronisationtransaction.service',
    );
}

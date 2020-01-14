import {BindingKey} from '@loopback/context';
import {repository} from '@loopback/repository';
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
    const newAccountTransactionsAsc = accountTransactions.sort(
      this.compareByDateIbanBicNameTextValue,
    );
    const alreadySavedAccountTransactionsFromDb = await this.findAlreadySavedAccountTransactions(
      newAccountTransactionsAsc,
      accountSettings,
    );
    console.log('Already saved:');
    console.log(alreadySavedAccountTransactionsFromDb);
    const alreadySavedAccountTransactionsFromDbAsc = alreadySavedAccountTransactionsFromDb.sort(
      this.compareByDateIbanBicNameTextValue,
    );

    const mergedAccountTransactions = this.merge(
      alreadySavedAccountTransactionsFromDbAsc,
      newAccountTransactionsAsc,
    );

    const mergedAccountTransactionsFromDb = await this.accountTransactionRepository.createAll(
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
      accountTransactionsInAscendingDateOrder[
        accountTransactionsInAscendingDateOrder.length - 1
      ].date;
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
    return (a.date.getTime === b.date.getTime ? 0 : a.date < b.date ? 1 : -1) ||
      a.iban !== undefined
      ? a.iban!.localeCompare(b.iban!)
      : 0 || a.bic !== undefined
      ? a.bic!.localeCompare(b.bic!)
      : 0 || a.name !== undefined
      ? a.name!.localeCompare(b.name!)
      : 0 || a.text !== undefined
      ? a.text!.localeCompare(b.text!)
      : 0 || a.amount! - b.amount!;
  }
}

export namespace AccountSynchronisationTransactionServiceBindings {
  export const SERVICE = BindingKey.create<
    AccountSynchronisationTransactionService
  >('services.accountsynchronisationtransaction.service');
}

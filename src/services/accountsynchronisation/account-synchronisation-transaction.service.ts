import {repository} from '@loopback/repository';
import {AccountSettings, AccountTransaction} from '../../models';
import {AccountTransactionRepository} from '../../repositories/account-transaction.repository';

export class AccountSynchronisationSaveService {
  constructor(
    @repository(AccountTransactionRepository)
    private accountTransactionRepository: AccountTransactionRepository,
  ) {}

  public async saveNewAccountTransactions(
    accountSettings: AccountSettings,
    accountTransactions: AccountTransaction[],
  ): Promise<AccountTransaction[]> {
    const newAccountTransactionsInAscendingOrder = accountTransactions.sort(
      this.compareByDateIbanBicNameTextValue,
    );
    const alreadySavedAccountTransactionsFromDb = (await this.findAlreadySavedAccountTransactions(
      newAccountTransactionsInAscendingOrder,
      accountSettings,
    )).sort(this.compareByDateIbanBicNameTextValue);

    const mergedAccountTransactions = this.merge(
      alreadySavedAccountTransactionsFromDb,
      newAccountTransactionsInAscendingOrder,
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
    return (
      (a.date.getTime === b.date.getTime ? 0 : a.date < b.date ? 1 : -1) ||
      a.iban!.localeCompare(b.iban!) ||
      a.bic!.localeCompare(b.bic!) ||
      a.name!.localeCompare(b.name!) ||
      a.text!.localeCompare(b.text!) ||
      a.text!.localeCompare(b.text!) ||
      a.amount! - b.amount!
    );
  }
}

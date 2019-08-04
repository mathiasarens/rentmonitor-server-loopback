import { AccountSettings, AccountTransaction } from '../../models';
import { AccountTransactionRepository } from '../../repositories/account-transaction.repository';
export declare class AccountSynchronisationSaveService {
    private accountTransactionRepository;
    constructor(accountTransactionRepository: AccountTransactionRepository);
    saveNewAccountTransactions(accountSettings: AccountSettings, accountTransactions: AccountTransaction[]): Promise<AccountTransaction[]>;
    private merge;
    private findAlreadySavedAccountTransactions;
    private compareByDateIbanBicNameTextValue;
}

import { AccountSettingsRepository } from '../../repositories';
import { AccountTransactionLogRepository } from '../../repositories/account-transaction-log.repository';
import { AccountSynchronisationBookingService } from './account-synchronisation-booking.service';
import { AccountSynchronisationSaveService } from './account-synchronisation-transaction.service';
import { FintsAccountTransactionSynchronizationService } from './fints.service';
export declare class AccountSynchronisationService {
    private accountSettingsRepository;
    private accountTransactionLogRepository;
    private fintsAccountTransactionSynchronization;
    private accountSynchronisationSaveService;
    private accountSynchronisationBookingService;
    constructor(accountSettingsRepository: AccountSettingsRepository, accountTransactionLogRepository: AccountTransactionLogRepository, fintsAccountTransactionSynchronization: FintsAccountTransactionSynchronizationService, accountSynchronisationSaveService: AccountSynchronisationSaveService, accountSynchronisationBookingService: AccountSynchronisationBookingService);
    retrieveAndSaveNewAccountTransactionsAndCreateNewBookings(now: Date, clientId: number): Promise<void>;
    private retrieveAndSaveNewAccountTransactions;
    private convertToAccountTransaction;
    private logAccountTransactions;
}

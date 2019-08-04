import { AccountTransaction, Booking } from '../../models';
import { AccountTransactionRepository, BookingRepository, ContractRepository } from '../../repositories';
export declare class AccountSynchronisationBookingService {
    private contractRepository;
    private bookingRepository;
    private accountTransactionRepository;
    constructor(contractRepository: ContractRepository, bookingRepository: BookingRepository, accountTransactionRepository: AccountTransactionRepository);
    createAndSaveBookings(clientId: number, accountTransactions: AccountTransaction[], now: Date): Promise<[Booking[], AccountTransaction[]]>;
    private createAndSaveBookingsByContracts;
    private matchAccountTransactionAndContract;
    private createBookingFromAccountTransactionAndContract;
}

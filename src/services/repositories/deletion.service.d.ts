import { AccountSettingsRepository, AccountTransactionLogRepository, AccountTransactionRepository, BookingRepository, ClientRepository, ContractRepository, TenantRepository } from '../../repositories';
export declare class DeletionService {
    private clientRepository;
    private tenantRepository;
    private contractRepository;
    private bookingRepository;
    private accountSettingsRepository;
    private accountTransactionRepository;
    private accountTransactionLogRepository;
    constructor(clientRepository: ClientRepository, tenantRepository: TenantRepository, contractRepository: ContractRepository, bookingRepository: BookingRepository, accountSettingsRepository: AccountSettingsRepository, accountTransactionRepository: AccountTransactionRepository, accountTransactionLogRepository: AccountTransactionLogRepository);
    deleteAll(): Promise<void>;
    deleteClient(clientId: number): Promise<void>;
}

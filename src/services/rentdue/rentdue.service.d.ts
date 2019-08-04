import { BookingRepository, ContractRepository, TenantRepository } from '../../repositories';
import { RentDueCalculationService } from './rentdue.calculation.service';
export declare class RentDueService {
    private tenantRepository;
    private contractRepository;
    private bookingRepository;
    private rentDueCalculationService;
    constructor(tenantRepository: TenantRepository, contractRepository: ContractRepository, bookingRepository: BookingRepository, rentDueCalculationService: RentDueCalculationService);
    calculateRentDueAndSaveResultsToDatabase(clientId: number, now: Date): Promise<void>;
    private findLatestRentDueBookingsForDebitors;
    private findLatestBookingForTenantAndContract;
}

import { Booking } from '../../models';
import { LatestRentDueBooking } from './latest.rent.due.booking';
export declare class RentDueCalculationService {
    calculateRentDueBookings(today: Date, latestRentDueBookingsPerTenant: LatestRentDueBooking[]): Promise<Booking[]>;
    private calculateRentDueBookingsPerContract;
    private createBooking;
    private nextPossibleRentDueDate;
    private min;
}

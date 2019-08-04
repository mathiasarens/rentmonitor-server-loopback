import { Contract } from '../../models';
export declare class LatestRentDueBooking {
    contract: Contract;
    bookingDate?: Date | undefined;
    constructor(contract: Contract, bookingDate?: Date | undefined);
}

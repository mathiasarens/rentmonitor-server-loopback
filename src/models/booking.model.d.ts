import { Entity } from '@loopback/repository';
export declare class Booking extends Entity {
    id: number;
    clientId: number;
    tenantId: number;
    contractId: number;
    accountTransactionId?: number;
    date: Date;
    comment?: string;
    amount?: number;
    type?: string;
    constructor(data?: Partial<Booking>);
}
export declare enum BookingType {
    RENT_DUE = "RENT_DUE"
}

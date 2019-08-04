import { Entity } from '@loopback/repository';
export declare class AccountTransaction extends Entity {
    id: number;
    clientId: number;
    accountSettingsId: number;
    date: Date;
    name?: string;
    iban?: string;
    bic?: string;
    text?: string;
    amount?: number;
    bookingId: number;
    constructor(data?: Partial<AccountTransaction>);
}

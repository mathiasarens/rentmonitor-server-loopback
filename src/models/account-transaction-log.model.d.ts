import { Entity } from '@loopback/repository';
export declare class AccountTransactionLog extends Entity {
    id: number;
    clientId: number;
    accountSettingsId: number;
    time: Date;
    rawstring: string;
    constructor(data?: Partial<AccountTransactionLog>);
}

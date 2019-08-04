import { Entity } from '@loopback/repository';
export declare class Contract extends Entity {
    id: number;
    clientId: number;
    tenantId: number;
    start: Date;
    end?: Date;
    rentDueEveryMonth: number;
    rentDueDayOfMonth: number;
    amount: number;
    accountSynchronisationName: string;
    private isActive;
    constructor(data?: Partial<Contract>);
}

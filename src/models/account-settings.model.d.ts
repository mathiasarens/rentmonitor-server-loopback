import { Entity } from '@loopback/repository';
export declare class AccountSettings extends Entity {
    id: number;
    clientId: number;
    fintsBlz?: string;
    fintsUrl?: string;
    fintsUser?: string;
    fintsPassword?: string;
    constructor(data?: Partial<AccountSettings>);
}

import { Client, Tenant } from '../../../src/models';
export declare function givenEmptyDatabase(): Promise<void>;
export declare function givenClientData(data?: Partial<Client>): {
    name: string;
} & Partial<Client>;
export declare function givenDebitorData(data?: Partial<Tenant>): {
    name: string;
} & Partial<Tenant>;
export declare function givenClient(data?: Partial<Client>): Promise<Client>;
export declare function givenTenant(data?: Partial<Tenant>): Promise<Tenant>;

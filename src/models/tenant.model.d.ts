import { Entity } from '@loopback/repository';
import { Contract } from '.';
export declare class Tenant extends Entity {
    id: number;
    clientId: number;
    contracts: Contract[];
    name: string;
    email: string;
    phone: string;
    constructor(data?: Partial<Tenant>);
}

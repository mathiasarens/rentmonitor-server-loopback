import { Entity } from '@loopback/repository';
export declare class Client extends Entity {
    id: number;
    name: string;
    constructor(data?: Partial<Client>);
}

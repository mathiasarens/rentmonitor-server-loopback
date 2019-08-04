import { Count, Filter, Where } from '@loopback/repository';
import { Client } from '../models';
import { ClientRepository } from '../repositories';
export declare class ClientController {
    clientRepository: ClientRepository;
    constructor(clientRepository: ClientRepository);
    create(client: Client): Promise<Client>;
    count(where?: Where<Client>): Promise<Count>;
    find(filter?: Filter<Client>): Promise<Client[]>;
    updateAll(client: Client, where?: Where<Client>): Promise<Count>;
    findById(id: number): Promise<Client>;
    updateById(id: number, client: Client): Promise<void>;
    replaceById(id: number, client: Client): Promise<void>;
    deleteById(id: number): Promise<void>;
}

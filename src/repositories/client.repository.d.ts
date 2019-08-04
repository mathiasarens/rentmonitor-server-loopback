import { DefaultCrudRepository } from '@loopback/repository';
import { RentmonitorDataSource } from '../datasources';
import { Client } from '../models';
export declare class ClientRepository extends DefaultCrudRepository<Client, typeof Client.prototype.id> {
    constructor(dataSource: RentmonitorDataSource);
}

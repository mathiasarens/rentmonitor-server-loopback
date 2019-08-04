import { Getter } from '@loopback/context';
import { BelongsToAccessor, DefaultCrudRepository } from '@loopback/repository';
import { RentmonitorDataSource } from '../datasources';
import { Client, Tenant } from '../models';
import { ClientRepository } from './client.repository';
export declare class TenantRepository extends DefaultCrudRepository<Tenant, typeof Tenant.prototype.id> {
    readonly client: BelongsToAccessor<Client, typeof Tenant.prototype.id>;
    constructor(dataSource: RentmonitorDataSource, clientRepositoryGetter: Getter<ClientRepository>);
}

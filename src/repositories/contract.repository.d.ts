import { Getter } from '@loopback/context';
import { BelongsToAccessor, DefaultCrudRepository } from '@loopback/repository';
import { RentmonitorDataSource } from '../datasources';
import { Client, Contract, Tenant } from '../models';
import { ClientRepository } from './client.repository';
import { TenantRepository } from './tenant.repository';
export declare class ContractRepository extends DefaultCrudRepository<Contract, typeof Contract.prototype.id> {
    readonly client: BelongsToAccessor<Client, typeof Contract.prototype.id>;
    readonly tenant: BelongsToAccessor<Tenant, typeof Contract.prototype.id>;
    constructor(dataSource: RentmonitorDataSource, clientRepositoryGetter: Getter<ClientRepository>, tenantRepositoryGetter: Getter<TenantRepository>);
    findActiveContracts(clientId: number, now: Date): Promise<Contract[]>;
}

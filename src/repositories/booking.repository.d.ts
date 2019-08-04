import { Getter } from '@loopback/context';
import { BelongsToAccessor, DefaultCrudRepository } from '@loopback/repository';
import { ClientRepository, ContractRepository, TenantRepository } from '.';
import { RentmonitorDataSource } from '../datasources';
import { Booking, Client, Contract, Tenant } from '../models';
export declare class BookingRepository extends DefaultCrudRepository<Booking, typeof Booking.prototype.id> {
    readonly client: BelongsToAccessor<Client, typeof Booking.prototype.id>;
    readonly tenant: BelongsToAccessor<Tenant, typeof Booking.prototype.id>;
    readonly contract: BelongsToAccessor<Contract, typeof Booking.prototype.id>;
    constructor(dataSource: RentmonitorDataSource, clientRepositoryGetter: Getter<ClientRepository>, tenantRepositoryGetter: Getter<TenantRepository>, contractRepositoryGetter: Getter<ContractRepository>);
}

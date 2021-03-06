import {Getter, inject} from '@loopback/context';
import {
  BelongsToAccessor,
  DefaultCrudRepository,
  repository,
} from '@loopback/repository';
import {ClientRepository, ContractRepository, TenantRepository} from '.';
import {RentmonitorDataSource} from '../datasources';
import {Booking, Client, Contract, Tenant} from '../models';

export class BookingRepository extends DefaultCrudRepository<
  Booking,
  typeof Booking.prototype.id
> {
  public readonly client: BelongsToAccessor<
    Client,
    typeof Booking.prototype.id
  >;

  public readonly tenant: BelongsToAccessor<
    Tenant,
    typeof Booking.prototype.id
  >;

  public readonly contract: BelongsToAccessor<
    Contract,
    typeof Booking.prototype.id
  >;

  constructor(
    @inject('datasources.rentmonitor') dataSource: RentmonitorDataSource,
    @repository.getter('ClientRepository')
    clientRepositoryGetter: Getter<ClientRepository>,
    @repository.getter('TenantRepository')
    tenantRepositoryGetter: Getter<TenantRepository>,
    @repository.getter('ContractRepository')
    contractRepositoryGetter: Getter<ContractRepository>,
  ) {
    super(Booking, dataSource);
    this.client = this.createBelongsToAccessorFor(
      'client',
      clientRepositoryGetter,
    );
    this.tenant = this.createBelongsToAccessorFor(
      'tenant',
      tenantRepositoryGetter,
    );
    this.contract = this.createBelongsToAccessorFor(
      'contract',
      contractRepositoryGetter,
    );
  }
}

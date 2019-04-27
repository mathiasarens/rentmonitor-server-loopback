import {Getter, inject} from '@loopback/context';
import {
  BelongsToAccessor,
  DefaultCrudRepository,
  repository,
} from '@loopback/repository';
import {RentmonitorDataSource} from '../datasources';
import {Client, Tenant} from '../models';
import {ClientRepository} from './client.repository';

export class TenantRepository extends DefaultCrudRepository<
  Tenant,
  typeof Tenant.prototype.id
> {
  public readonly client: BelongsToAccessor<Client, typeof Tenant.prototype.id>;

  constructor(
    @inject('datasources.rentmonitor') dataSource: RentmonitorDataSource,
    @repository.getter('ClientRepository')
    clientRepositoryGetter: Getter<ClientRepository>,
  ) {
    super(Tenant, dataSource);

    this.client = this.createBelongsToAccessorFor(
      'client',
      clientRepositoryGetter,
    );
  }
}

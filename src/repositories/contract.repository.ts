import {Getter, inject} from '@loopback/context';
import {
  BelongsToAccessor,
  DefaultCrudRepository,
  repository,
} from '@loopback/repository';
import {RentmonitorDataSource} from '../datasources';
import {Client, Contract, Tenant} from '../models';
import {ClientRepository} from './client.repository';
import {TenantRepository} from './tenant.repository';

export class ContractRepository extends DefaultCrudRepository<
  Contract,
  typeof Contract.prototype.id
> {
  public readonly client: BelongsToAccessor<
    Client,
    typeof Contract.prototype.id
  >;
  public readonly tenant: BelongsToAccessor<
    Tenant,
    typeof Contract.prototype.id
  >;

  constructor(
    @inject('datasources.rentmonitor') dataSource: RentmonitorDataSource,
    @repository.getter('ClientRepository')
    clientRepositoryGetter: Getter<ClientRepository>,
    @repository.getter('TenantRepository')
    tenantRepositoryGetter: Getter<TenantRepository>,
  ) {
    super(Contract, dataSource);

    this.client = this.createBelongsToAccessorFor(
      'client',
      clientRepositoryGetter,
    );

    this.tenant = this.createBelongsToAccessorFor(
      'tenant',
      tenantRepositoryGetter,
    );
  }

  public async findActiveContracts(
    clientId: number,
    now: Date,
  ): Promise<Contract[]> {
    const contracts: Contract[] = await this.find({
      where: {
        clientId: clientId,
        start: {lte: now},
      },
    });
    const activeContracts = contracts.filter(
      e => e.end == null || e.end >= now,
    );
    return activeContracts;
  }
}

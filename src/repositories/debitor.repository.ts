import {inject} from '@loopback/context';
import {
  DefaultCrudRepository,
  BelongsToAccessor,
  // repository,
} from '@loopback/repository';
import {Debitor, Client} from '../models';
import {RentmonitorDataSource} from '../datasources';
// import {ClientRepository} from '../repositories';

export class DebitorRepository extends DefaultCrudRepository<
  Debitor,
  typeof Debitor.prototype.id
> {
  public readonly client: BelongsToAccessor<
    Client,
    typeof Debitor.prototype.id
  >;

  constructor(
    @inject('datasources.rentmonitor') dataSource: RentmonitorDataSource,
    // @repository.getter('ClientRepository')
    // clientRepositoryGetter: Getter<ClientRepository>,
  ) {
    super(Debitor, dataSource);

    // this.client = this.createBelongsToAccessorFor(
    //   'client',
    //   clientRepositoryGetter,
    // );
  }
}

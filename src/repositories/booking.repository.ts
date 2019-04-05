import {Getter, inject} from '@loopback/context';
import {
  DefaultCrudRepository,
  BelongsToAccessor,
  repository,
} from '@loopback/repository';
import {Booking, Debitor, Client} from '../models';
import {RentmonitorDataSource} from '../datasources';
import {ClientRepository} from '.';

export class BookingRepository extends DefaultCrudRepository<
  Booking,
  typeof Booking.prototype.id
> {
  public readonly client: BelongsToAccessor<Client, typeof Client.prototype.id>;

  public readonly debitor: BelongsToAccessor<
    Debitor,
    typeof Debitor.prototype.id
  >;

  constructor(
    @inject('datasources.rentmonitor') dataSource: RentmonitorDataSource,
    @repository.getter(ClientRepository)
    clientRepositoryGetter: Getter<ClientRepository>,
  ) {
    super(Booking, dataSource);
  }
}
